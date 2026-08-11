package com.omarabusahmoud.portfolio.skill.repository;

import java.util.List;
import java.util.UUID;
import com.omarabusahmoud.portfolio.skill.entity.PortfolioSkillEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioSkillRepository extends JpaRepository<PortfolioSkillEntity, UUID> {
    List<PortfolioSkillEntity> findAllByPublishedTrueOrderByDisplayOrderAsc();
    List<PortfolioSkillEntity> findAllByOrderByDisplayOrderAsc();
}
