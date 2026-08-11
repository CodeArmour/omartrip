package com.omarabusahmoud.portfolio.common.controller;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "System", description = "Application health and readiness")
public class HealthController {

    @GetMapping
    @Operation(summary = "Check API health")
    @ApiResponse(responseCode = "200", description = "API is running")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "portfolio-backend",
                "timestamp", Instant.now().toString()));
    }
}
