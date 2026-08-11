package com.omarabusahmoud.portfolio.guestbook.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import com.omarabusahmoud.portfolio.guestbook.config.GuestbookProperties;
import com.omarabusahmoud.portfolio.guestbook.dto.GuestbookMessageResponse;
import com.omarabusahmoud.portfolio.guestbook.dto.GuestbookPageResponse;
import com.omarabusahmoud.portfolio.guestbook.entity.GuestbookMessageEntity;
import com.omarabusahmoud.portfolio.guestbook.entity.GuestbookUserEntity;
import com.omarabusahmoud.portfolio.guestbook.exception.GuestbookForbiddenException;
import com.omarabusahmoud.portfolio.guestbook.exception.GuestbookAlreadyPostedException;
import com.omarabusahmoud.portfolio.guestbook.exception.GuestbookMessageNotFoundException;
import com.omarabusahmoud.portfolio.guestbook.exception.GuestbookRateLimitException;
import com.omarabusahmoud.portfolio.guestbook.model.GuestbookMessageStatus;
import com.omarabusahmoud.portfolio.guestbook.repository.GuestbookMessageRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GuestbookMessageService {
    private static final java.util.List<GuestbookMessageStatus> ACTIVE_STATUSES =
            java.util.List.of(GuestbookMessageStatus.PENDING, GuestbookMessageStatus.VISIBLE);
    private final GuestbookMessageRepository repository;
    private final GuestbookProperties properties;
    private final Clock clock;

    public GuestbookMessageService(GuestbookMessageRepository repository, GuestbookProperties properties, Clock clock) {
        this.repository = repository;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public GuestbookPageResponse listVisible(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.clamp(size, 1, 50);
        return GuestbookPageResponse.from(repository.findAllByStatus(
                GuestbookMessageStatus.VISIBLE,
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @Transactional(readOnly = true)
    public GuestbookPageResponse listPending(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.clamp(size, 1, 50);
        return GuestbookPageResponse.from(repository.findAllByStatus(
                GuestbookMessageStatus.PENDING,
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.ASC, "createdAt"))));
    }

    @Transactional
    public GuestbookMessageResponse create(GuestbookUserEntity user, String rawContent) {
        String content = normalize(rawContent);
        Instant now = clock.instant();
        if (repository.findFirstByUserIdAndStatusInOrderByCreatedAtDesc(user.getId(), ACTIVE_STATUSES)
                .isPresent()) {
            throw new GuestbookAlreadyPostedException();
        }
        if (repository.countByUserIdAndCreatedAtAfter(user.getId(), now.minus(Duration.ofHours(1)))
                >= properties.maxMessagesPerHour()) {
            throw new GuestbookRateLimitException("You are posting too quickly. Please wait a moment and try again.");
        }
        if (repository.existsByUserIdAndContentAndCreatedAtAfter(
                user.getId(), content, now.minus(Duration.ofMinutes(properties.duplicateWindowMinutes())))) {
            throw new GuestbookRateLimitException("This message was already added recently.");
        }
        return GuestbookMessageResponse.from(repository.saveAndFlush(
                new GuestbookMessageEntity(UUID.randomUUID(), user, content, now)));
    }

    @Transactional(readOnly = true)
    public GuestbookMessageResponse findMine(GuestbookUserEntity user) {
        return repository.findFirstByUserIdAndStatusInOrderByCreatedAtDesc(user.getId(), ACTIVE_STATUSES)
                .map(GuestbookMessageResponse::from)
                .orElse(null);
    }

    @Transactional
    public GuestbookMessageResponse edit(UUID id, GuestbookUserEntity user, String rawContent) {
        GuestbookMessageEntity message = ownedMessage(id, user);
        message.edit(normalize(rawContent), clock.instant());
        return GuestbookMessageResponse.from(repository.saveAndFlush(message));
    }

    @Transactional
    public void delete(UUID id, GuestbookUserEntity user) {
        GuestbookMessageEntity message = ownedMessage(id, user);
        message.hide(clock.instant());
        repository.saveAndFlush(message);
    }

    @Transactional
    public GuestbookMessageResponse approve(UUID id) {
        GuestbookMessageEntity message = repository.findById(id)
                .orElseThrow(GuestbookMessageNotFoundException::new);
        message.approve(clock.instant());
        return GuestbookMessageResponse.from(repository.saveAndFlush(message));
    }

    @Transactional
    public GuestbookMessageResponse moderateHide(UUID id) {
        GuestbookMessageEntity message = repository.findById(id)
                .orElseThrow(GuestbookMessageNotFoundException::new);
        message.hide(clock.instant());
        return GuestbookMessageResponse.from(repository.saveAndFlush(message));
    }

    private GuestbookMessageEntity ownedMessage(UUID id, GuestbookUserEntity user) {
        GuestbookMessageEntity message = repository.findById(id)
                .orElseThrow(GuestbookMessageNotFoundException::new);
        if (!message.getUser().getId().equals(user.getId())) throw new GuestbookForbiddenException();
        return message;
    }

    private String normalize(String value) {
        return value.trim().replace("\r\n", "\n").replace('\r', '\n');
    }
}
