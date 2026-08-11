package com.omarabusahmoud.portfolio.skill.service;

import java.time.Clock;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.omarabusahmoud.portfolio.skill.dto.PortfolioSkillResponse;
import com.omarabusahmoud.portfolio.skill.dto.UpsertSkillRequest;
import com.omarabusahmoud.portfolio.skill.entity.PortfolioSkillEntity;
import com.omarabusahmoud.portfolio.skill.repository.PortfolioSkillRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PortfolioSkillService {
    private final PortfolioSkillRepository repository;
    private final Clock clock;

    public PortfolioSkillService(PortfolioSkillRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<PortfolioSkillResponse> publicSkills() {
        return repository.findAllByPublishedTrueOrderByDisplayOrderAsc().stream().map(PortfolioSkillResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<PortfolioSkillResponse> allSkills() {
        return repository.findAllByOrderByDisplayOrderAsc().stream().map(PortfolioSkillResponse::from).toList();
    }

    @Transactional
    public PortfolioSkillResponse create(UpsertSkillRequest request) {
        Instant now = clock.instant();
        return PortfolioSkillResponse.from(repository.saveAndFlush(
                new PortfolioSkillEntity(UUID.randomUUID(), request, (int) repository.count(), now)));
    }

    @Transactional
    public PortfolioSkillResponse update(UUID id, UpsertSkillRequest request) {
        PortfolioSkillEntity skill = find(id);
        skill.apply(request, clock.instant());
        return PortfolioSkillResponse.from(repository.saveAndFlush(skill));
    }

    @Transactional
    public PortfolioSkillResponse setPublished(UUID id, boolean published) {
        PortfolioSkillEntity skill = find(id);
        skill.setPublished(published, clock.instant());
        return PortfolioSkillResponse.from(repository.saveAndFlush(skill));
    }

    @Transactional
    public List<PortfolioSkillResponse> reorder(List<UUID> ids) {
        List<PortfolioSkillEntity> skills = repository.findAllByOrderByDisplayOrderAsc();
        if (ids.size() != skills.size() || !skills.stream().map(PortfolioSkillEntity::getId).collect(Collectors.toSet()).equals(new HashSet<>(ids))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Every skill must appear exactly once");
        }
        Instant now = clock.instant();
        for (int index = 0; index < ids.size(); index++) find(ids.get(index)).reorder(index, now);
        repository.flush();
        return allSkills();
    }

    @Transactional
    public void delete(UUID id) { repository.delete(find(id)); }

    private PortfolioSkillEntity find(UUID id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Skill was not found"));
    }
}
