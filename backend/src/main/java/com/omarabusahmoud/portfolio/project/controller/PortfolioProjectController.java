package com.omarabusahmoud.portfolio.project.controller;

import java.util.List;
import java.util.UUID;

import com.omarabusahmoud.portfolio.auth.service.PortfolioAuthorizationService;
import com.omarabusahmoud.portfolio.project.dto.PortfolioProjectResponse;
import com.omarabusahmoud.portfolio.project.dto.ReorderProjectsRequest;
import com.omarabusahmoud.portfolio.project.dto.UpsertProjectRequest;
import com.omarabusahmoud.portfolio.project.service.PortfolioProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/projects")
public class PortfolioProjectController {
    private final PortfolioProjectService projects;
    private final PortfolioAuthorizationService authorization;

    public PortfolioProjectController(PortfolioProjectService projects, PortfolioAuthorizationService authorization) {
        this.projects = projects;
        this.authorization = authorization;
    }

    @GetMapping
    public List<PortfolioProjectResponse> publicProjects() { return projects.publicProjects(); }

    @GetMapping("/admin")
    public List<PortfolioProjectResponse> all(Authentication authentication) {
        authorization.requireOwner(authentication);
        return projects.allProjects();
    }

    @PostMapping("/admin")
    @ResponseStatus(HttpStatus.CREATED)
    public PortfolioProjectResponse create(@Valid @RequestBody UpsertProjectRequest request, Authentication authentication) {
        authorization.requireOwner(authentication);
        return projects.create(request);
    }

    @PutMapping("/admin/{id}")
    public PortfolioProjectResponse update(@PathVariable UUID id, @Valid @RequestBody UpsertProjectRequest request, Authentication authentication) {
        authorization.requireOwner(authentication);
        return projects.update(id, request);
    }

    @PatchMapping("/admin/{id}/publication")
    public PortfolioProjectResponse publication(@PathVariable UUID id, @RequestParam boolean published, Authentication authentication) {
        authorization.requireOwner(authentication);
        return projects.setPublished(id, published);
    }

    @PatchMapping("/admin/reorder")
    public List<PortfolioProjectResponse> reorder(@Valid @RequestBody ReorderProjectsRequest request, Authentication authentication) {
        authorization.requireOwner(authentication);
        return projects.reorder(request.projectIds());
    }

    @DeleteMapping("/admin/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, Authentication authentication) {
        authorization.requireOwner(authentication);
        projects.delete(id);
    }
}
