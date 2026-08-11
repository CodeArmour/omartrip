package com.omarabusahmoud.portfolio.profile.service;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

import com.omarabusahmoud.portfolio.profile.dto.PortfolioProfileResponse;
import com.omarabusahmoud.portfolio.profile.dto.UpsertProfileRequest;
import com.omarabusahmoud.portfolio.profile.entity.PortfolioProfileEntity;
import com.omarabusahmoud.portfolio.profile.repository.PortfolioProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PortfolioProfileService {
    private final PortfolioProfileRepository repository;
    private final Clock clock;

    public PortfolioProfileService(PortfolioProfileRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public PortfolioProfileResponse get() {
        return repository.findFirstByOrderByUpdatedAtDesc().map(PortfolioProfileResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile was not configured"));
    }

    @Transactional
    public PortfolioProfileResponse update(UpsertProfileRequest request) {
        PortfolioProfileEntity profile = repository.findFirstByOrderByUpdatedAtDesc()
                .orElseGet(() -> new PortfolioProfileEntity(UUID.randomUUID(), request, clock.instant()));
        profile.apply(request, Instant.now(clock));
        return PortfolioProfileResponse.from(repository.saveAndFlush(profile));
    }
}
