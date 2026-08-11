package com.omarabusahmoud.portfolio.guestbook.repository;

import java.time.Instant;
import java.util.UUID;
import java.util.Collection;
import java.util.Optional;
import com.omarabusahmoud.portfolio.guestbook.entity.GuestbookMessageEntity;
import com.omarabusahmoud.portfolio.guestbook.model.GuestbookMessageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GuestbookMessageRepository extends JpaRepository<GuestbookMessageEntity, UUID> {
    Page<GuestbookMessageEntity> findAllByStatus(GuestbookMessageStatus status, Pageable pageable);
    long countByUserIdAndCreatedAtAfter(UUID userId, Instant createdAfter);
    boolean existsByUserIdAndContentAndCreatedAtAfter(UUID userId, String content, Instant createdAfter);
    Optional<GuestbookMessageEntity> findFirstByUserIdAndStatusInOrderByCreatedAtDesc(
            UUID userId, Collection<GuestbookMessageStatus> statuses);
}
