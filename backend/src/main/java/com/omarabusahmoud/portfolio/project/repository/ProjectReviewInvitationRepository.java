package com.omarabusahmoud.portfolio.project.repository;

import java.util.Optional;
import java.util.UUID;

import com.omarabusahmoud.portfolio.project.entity.ProjectReviewInvitationEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectReviewInvitationRepository extends JpaRepository<ProjectReviewInvitationEntity, UUID> {
    Optional<ProjectReviewInvitationEntity> findByTokenHash(String tokenHash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select invitation from ProjectReviewInvitationEntity invitation where invitation.tokenHash = :tokenHash")
    Optional<ProjectReviewInvitationEntity> findLockedByTokenHash(@Param("tokenHash") String tokenHash);
}
