package com.omarabusahmoud.portfolio.assistant.controller;

import com.omarabusahmoud.portfolio.assistant.dto.AssistantRequest;
import com.omarabusahmoud.portfolio.assistant.dto.AssistantResponse;
import com.omarabusahmoud.portfolio.assistant.service.PortfolioAssistantService;
import com.omarabusahmoud.portfolio.assistant.service.AssistantRateLimiter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/assistant")
@Tag(name = "Portfolio Assistant", description = "Omar-specific portfolio questions")
public class PortfolioAssistantController {
    private final PortfolioAssistantService service;
    private final AssistantRateLimiter rateLimiter;

    public PortfolioAssistantController(PortfolioAssistantService service, AssistantRateLimiter rateLimiter) {
        this.service = service;
        this.rateLimiter = rateLimiter;
    }

    @PostMapping("/messages")
    @Operation(summary = "Ask Omar's portfolio assistant")
    public AssistantResponse answer(@Valid @RequestBody AssistantRequest request) {
        rateLimiter.acquire();
        return service.answer(request.message());
    }
}
