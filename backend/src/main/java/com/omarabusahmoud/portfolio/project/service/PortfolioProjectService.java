package com.omarabusahmoud.portfolio.project.service;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.omarabusahmoud.portfolio.project.dto.PortfolioProjectResponse;
import com.omarabusahmoud.portfolio.project.dto.UpsertProjectRequest;
import com.omarabusahmoud.portfolio.project.entity.PortfolioProjectEntity;
import com.omarabusahmoud.portfolio.project.repository.PortfolioProjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PortfolioProjectService {
    private final PortfolioProjectRepository repository;
    private final Clock clock;

    public PortfolioProjectService(PortfolioProjectRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<PortfolioProjectResponse> publicProjects() {
        return repository.findAllByPublishedTrueOrderByDisplayOrderAsc().stream().map(PortfolioProjectResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<PortfolioProjectResponse> allProjects() {
        return repository.findAllByOrderByDisplayOrderAsc().stream().map(PortfolioProjectResponse::from).toList();
    }

    @Transactional
    public PortfolioProjectResponse create(UpsertProjectRequest request) {
        Instant now = clock.instant();
        PortfolioProjectEntity project = new PortfolioProjectEntity(UUID.randomUUID(), request, (int) repository.count(), now);
        return PortfolioProjectResponse.from(repository.saveAndFlush(project));
    }

    @Transactional
    public PortfolioProjectResponse update(UUID id, UpsertProjectRequest request) {
        PortfolioProjectEntity project = find(id);
        project.apply(request, clock.instant());
        return PortfolioProjectResponse.from(repository.saveAndFlush(project));
    }

    @Transactional
    public PortfolioProjectResponse setPublished(UUID id, boolean published) {
        PortfolioProjectEntity project = find(id);
        project.setPublished(published, clock.instant());
        return PortfolioProjectResponse.from(repository.saveAndFlush(project));
    }

    @Transactional
    public List<PortfolioProjectResponse> reorder(List<UUID> ids) {
        List<PortfolioProjectEntity> projects = repository.findAllByOrderByDisplayOrderAsc();
        if (ids.size() != projects.size() || !projects.stream().map(PortfolioProjectEntity::getId).collect(java.util.stream.Collectors.toSet()).equals(new java.util.HashSet<>(ids))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Every project must appear exactly once");
        }
        Instant now = clock.instant();
        for (int index = 0; index < ids.size(); index++) find(ids.get(index)).reorder(index, now);
        repository.flush();
        return allProjects();
    }

    @Transactional
    public void delete(UUID id) { repository.delete(find(id)); }

    private PortfolioProjectEntity find(UUID id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project was not found"));
    }
}
