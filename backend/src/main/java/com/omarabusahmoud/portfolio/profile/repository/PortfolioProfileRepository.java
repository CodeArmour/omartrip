package com.omarabusahmoud.portfolio.profile.repository;

import java.util.Optional;
import java.util.UUID;
import com.omarabusahmoud.portfolio.profile.entity.PortfolioProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioProfileRepository extends JpaRepository<PortfolioProfileEntity, UUID> {
    Optional<PortfolioProfileEntity> findFirstByOrderByUpdatedAtDesc();
}
