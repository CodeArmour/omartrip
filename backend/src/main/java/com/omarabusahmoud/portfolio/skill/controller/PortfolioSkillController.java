package com.omarabusahmoud.portfolio.skill.controller;

import java.util.List;
import java.util.UUID;

import com.omarabusahmoud.portfolio.auth.service.PortfolioAuthorizationService;
import com.omarabusahmoud.portfolio.project.dto.ProjectImageUploadResponse;
import com.omarabusahmoud.portfolio.project.service.CloudinaryProjectImageService;
import com.omarabusahmoud.portfolio.skill.dto.PortfolioSkillResponse;
import com.omarabusahmoud.portfolio.skill.dto.ReorderSkillsRequest;
import com.omarabusahmoud.portfolio.skill.dto.UpsertSkillRequest;
import com.omarabusahmoud.portfolio.skill.service.PortfolioSkillService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/skills")
public class PortfolioSkillController {
    private final PortfolioSkillService skills;
    private final CloudinaryProjectImageService images;
    private final PortfolioAuthorizationService authorization;

    public PortfolioSkillController(PortfolioSkillService skills, CloudinaryProjectImageService images, PortfolioAuthorizationService authorization) {
        this.skills = skills;
        this.images = images;
        this.authorization = authorization;
    }

    @GetMapping public List<PortfolioSkillResponse> publicSkills() { return skills.publicSkills(); }
    @GetMapping("/admin") public List<PortfolioSkillResponse> all(Authentication auth) { authorization.requireOwner(auth); return skills.allSkills(); }
    @PostMapping("/admin") @ResponseStatus(HttpStatus.CREATED)
    public PortfolioSkillResponse create(@Valid @RequestBody UpsertSkillRequest request, Authentication auth) { authorization.requireOwner(auth); return skills.create(request); }
    @PutMapping("/admin/{id}")
    public PortfolioSkillResponse update(@PathVariable UUID id, @Valid @RequestBody UpsertSkillRequest request, Authentication auth) { authorization.requireOwner(auth); return skills.update(id, request); }
    @PatchMapping("/admin/{id}/publication")
    public PortfolioSkillResponse publication(@PathVariable UUID id, @RequestParam boolean published, Authentication auth) { authorization.requireOwner(auth); return skills.setPublished(id, published); }
    @PatchMapping("/admin/reorder")
    public List<PortfolioSkillResponse> reorder(@Valid @RequestBody ReorderSkillsRequest request, Authentication auth) { authorization.requireOwner(auth); return skills.reorder(request.skillIds()); }
    @DeleteMapping("/admin/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, Authentication auth) { authorization.requireOwner(auth); skills.delete(id); }
    @PostMapping(value = "/admin/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProjectImageUploadResponse upload(@RequestPart("file") MultipartFile file, Authentication auth) { authorization.requireOwner(auth); return images.uploadSkill(file); }
}
