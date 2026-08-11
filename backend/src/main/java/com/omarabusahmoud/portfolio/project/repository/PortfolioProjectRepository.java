package com.omarabusahmoud.portfolio.project.repository;

import java.util.List;
import java.util.UUID;
import com.omarabusahmoud.portfolio.project.entity.PortfolioProjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioProjectRepository extends JpaRepository<PortfolioProjectEntity, UUID> {
    List<PortfolioProjectEntity> findAllByPublishedTrueOrderByDisplayOrderAsc();
    List<PortfolioProjectEntity> findAllByOrderByDisplayOrderAsc();
}
