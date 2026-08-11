package com.omarabusahmoud.portfolio.contact.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import com.omarabusahmoud.portfolio.contact.config.ContactProperties;
import com.omarabusahmoud.portfolio.contact.dto.ContactInquiryResult;
import com.omarabusahmoud.portfolio.contact.dto.CreateContactInquiryRequest;
import com.omarabusahmoud.portfolio.contact.entity.ContactInquiryEntity;
import com.omarabusahmoud.portfolio.contact.exception.ContactRateLimitException;
import com.omarabusahmoud.portfolio.contact.repository.ContactInquiryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContactInquiryService {
    private final ContactInquiryRepository repository;
    private final ContactProperties properties;
    private final Clock clock;

    public ContactInquiryService(ContactInquiryRepository repository, ContactProperties properties, Clock clock) {
        this.repository = repository;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional
    public ContactInquiryResult create(CreateContactInquiryRequest request) {
        if (request.company() != null && !request.company().isBlank()) {
            throw new IllegalArgumentException("Request could not be processed");
        }
        String idempotencyKey = normalize(request.idempotencyKey());
        ContactInquiryEntity existing = repository.findByIdempotencyKey(idempotencyKey).orElse(null);
        if (existing != null) return ContactInquiryResult.received(existing);

        Instant now = clock.instant();
        String email = normalize(request.email()).toLowerCase(Locale.ROOT);
        if (repository.countByEmailAndCreatedAtAfter(email, now.minus(Duration.ofHours(1)))
                >= properties.maxSubmissionsPerHour()) {
            throw new ContactRateLimitException();
        }
        ContactInquiryEntity inquiry = new ContactInquiryEntity(
                UUID.randomUUID(), normalize(request.fullName()), email, normalize(request.subject()),
                normalizeMultiline(request.message()), idempotencyKey, now);
        return ContactInquiryResult.received(repository.saveAndFlush(inquiry));
    }

    private String normalize(String value) {
        return value.trim().replaceAll("\\s+", " ");
    }

    private String normalizeMultiline(String value) {
        return value.trim().replace("\r\n", "\n").replace('\r', '\n');
    }
}
