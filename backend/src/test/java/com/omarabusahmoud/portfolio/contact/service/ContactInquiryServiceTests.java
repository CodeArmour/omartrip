package com.omarabusahmoud.portfolio.contact.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import com.omarabusahmoud.portfolio.contact.config.ContactProperties;
import com.omarabusahmoud.portfolio.contact.dto.ContactInquiryResult;
import com.omarabusahmoud.portfolio.contact.dto.CreateContactInquiryRequest;
import com.omarabusahmoud.portfolio.contact.entity.ContactInquiryEntity;
import com.omarabusahmoud.portfolio.contact.exception.ContactRateLimitException;
import com.omarabusahmoud.portfolio.contact.repository.ContactInquiryRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ContactInquiryServiceTests {

    private static final Instant NOW = Instant.parse("2026-08-09T18:00:00Z");
    private ContactInquiryRepository repository;
    private ContactInquiryService service;

    @BeforeEach
    void setUp() {
        repository = mock(ContactInquiryRepository.class);
        service = new ContactInquiryService(
                repository,
                new ContactProperties(3),
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void persistsANormalizedInquiry() {
        when(repository.findByIdempotencyKey("contact-key-123")).thenReturn(Optional.empty());
        when(repository.countByEmailAndCreatedAtAfter(any(), any())).thenReturn(0L);
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ContactInquiryResult result = service.create(request("  OMAR@example.com  ", ""));

        assertThat(result.status()).isEqualTo("new");
        assertThat(result.receivedAt()).isEqualTo(NOW);
        verify(repository).saveAndFlush(any(ContactInquiryEntity.class));
    }

    @Test
    void returnsTheExistingInquiryForAnIdempotentRetry() {
        ContactInquiryEntity existing = new ContactInquiryEntity(
                UUID.randomUUID(), "Visitor", "visitor@example.com", "Project inquiry",
                "A sufficiently detailed message.", "contact-key-123", NOW);
        when(repository.findByIdempotencyKey("contact-key-123")).thenReturn(Optional.of(existing));

        ContactInquiryResult result = service.create(request("visitor@example.com", ""));

        assertThat(result.id()).isEqualTo(existing.getId());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void rejectsRequestsAboveTheHourlyLimit() {
        when(repository.findByIdempotencyKey("contact-key-123")).thenReturn(Optional.empty());
        when(repository.countByEmailAndCreatedAtAfter(any(), any())).thenReturn(3L);

        assertThatThrownBy(() -> service.create(request("visitor@example.com", "")))
                .isInstanceOf(ContactRateLimitException.class);
    }

    @Test
    void rejectsFilledHoneypotWithoutTouchingTheRepository() {
        assertThatThrownBy(() -> service.create(request("visitor@example.com", "robot")))
                .isInstanceOf(IllegalArgumentException.class);
        verify(repository, never()).saveAndFlush(any());
    }

    private CreateContactInquiryRequest request(String email, String company) {
        return new CreateContactInquiryRequest(
                "  Example   Visitor  ", email, "  Project   inquiry  ",
                "A sufficiently detailed contact message.", "contact-key-123", company);
    }
}
