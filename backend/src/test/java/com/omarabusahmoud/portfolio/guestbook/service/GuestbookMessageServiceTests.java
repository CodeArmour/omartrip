package com.omarabusahmoud.portfolio.guestbook.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import com.omarabusahmoud.portfolio.guestbook.config.GuestbookProperties;
import com.omarabusahmoud.portfolio.guestbook.dto.GuestbookMessageResponse;
import com.omarabusahmoud.portfolio.guestbook.entity.GuestbookMessageEntity;
import com.omarabusahmoud.portfolio.guestbook.entity.GuestbookUserEntity;
import com.omarabusahmoud.portfolio.guestbook.exception.GuestbookForbiddenException;
import com.omarabusahmoud.portfolio.guestbook.exception.GuestbookRateLimitException;
import com.omarabusahmoud.portfolio.guestbook.model.GuestbookMessageStatus;
import com.omarabusahmoud.portfolio.guestbook.repository.GuestbookMessageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

class GuestbookMessageServiceTests {
    private static final Instant NOW = Instant.parse("2026-08-09T18:00:00Z");
    private GuestbookMessageRepository repository;
    private GuestbookMessageService service;
    private GuestbookUserEntity user;

    @BeforeEach
    void setUp() {
        repository = mock(GuestbookMessageRepository.class);
        service = new GuestbookMessageService(
                repository, new GuestbookProperties(5, 10, java.util.List.of("CodeArmour")),
                Clock.fixed(NOW, ZoneOffset.UTC));
        user = user(UUID.randomUUID(), "Visitor");
    }

    @Test
    void listsOnlyVisibleMessages() {
        GuestbookMessageEntity message = new GuestbookMessageEntity(
                UUID.randomUUID(), user, "Hello from the community", NOW);
        when(repository.findAllByStatus(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(java.util.List.of(message)));

        var response = service.listVisible(0, 20);

        assertThat(response.messages()).hasSize(1);
        verify(repository).findAllByStatus(any(GuestbookMessageStatus.class), any(Pageable.class));
    }

    @Test
    void createsAPendingPlainTextMessage() {
        when(repository.countByUserIdAndCreatedAtAfter(any(), any())).thenReturn(0L);
        when(repository.existsByUserIdAndContentAndCreatedAtAfter(any(), any(), any())).thenReturn(false);
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        GuestbookMessageResponse response = service.create(user, "  Hello <script>alert(1)</script>  ");

        assertThat(response.content()).isEqualTo("Hello <script>alert(1)</script>");
        assertThat(response.status()).isEqualTo("pending");
    }

    @Test
    void rejectsDuplicateMessagesInsideTheConfiguredWindow() {
        when(repository.countByUserIdAndCreatedAtAfter(any(), any())).thenReturn(0L);
        when(repository.existsByUserIdAndContentAndCreatedAtAfter(any(), any(), any())).thenReturn(true);

        assertThatThrownBy(() -> service.create(user, "Repeated message"))
                .isInstanceOf(GuestbookRateLimitException.class)
                .hasMessageContaining("already added");
    }

    @Test
    void enforcesOwnershipWhenEditing() {
        GuestbookUserEntity owner = user(UUID.randomUUID(), "Owner");
        GuestbookMessageEntity message = new GuestbookMessageEntity(
                UUID.randomUUID(), owner, "Original message", NOW);
        when(repository.findById(message.getId())).thenReturn(Optional.of(message));

        assertThatThrownBy(() -> service.edit(message.getId(), user, "Updated message"))
                .isInstanceOf(GuestbookForbiddenException.class);
    }

    @Test
    void softHidesAnOwnedMessage() {
        GuestbookMessageEntity message = new GuestbookMessageEntity(
                UUID.randomUUID(), user, "Original message", NOW.minusSeconds(60));
        when(repository.findById(message.getId())).thenReturn(Optional.of(message));
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.delete(message.getId(), user);

        assertThat(message.getStatus()).isEqualTo(GuestbookMessageStatus.HIDDEN);
        verify(repository).saveAndFlush(message);
    }

    private GuestbookUserEntity user(UUID id, String name) {
        return new GuestbookUserEntity(id, "github", id.toString(), name, null, NOW);
    }
}
