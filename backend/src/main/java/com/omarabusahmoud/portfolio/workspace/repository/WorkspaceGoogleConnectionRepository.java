package com.omarabusahmoud.portfolio.workspace.repository;

import java.util.Optional;
import java.util.UUID;

import com.omarabusahmoud.portfolio.workspace.entity.WorkspaceGoogleConnectionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceGoogleConnectionRepository extends JpaRepository<WorkspaceGoogleConnectionEntity, UUID> {
    Optional<WorkspaceGoogleConnectionEntity> findFirstByOrderByUpdatedAtDesc();
}
