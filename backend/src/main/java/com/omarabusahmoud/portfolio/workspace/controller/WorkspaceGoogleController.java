package com.omarabusahmoud.portfolio.workspace.controller;

import java.net.URI;

import com.omarabusahmoud.portfolio.auth.service.PortfolioAuthorizationService;
import com.omarabusahmoud.portfolio.workspace.config.WorkspaceGoogleProperties;
import com.omarabusahmoud.portfolio.workspace.service.WorkspaceGoogleConnectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import jakarta.servlet.http.HttpSession;
import com.omarabusahmoud.portfolio.auth.controller.PortfolioLoginController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/workspace/google")
public class WorkspaceGoogleController {
    private final PortfolioAuthorizationService authorization;
    private final WorkspaceGoogleConnectionService connection;
    private final WorkspaceGoogleProperties properties;

    public WorkspaceGoogleController(PortfolioAuthorizationService authorization,
            WorkspaceGoogleConnectionService connection, WorkspaceGoogleProperties properties) {
        this.authorization = authorization; this.connection = connection; this.properties = properties;
    }

    @GetMapping("/connect")
    public ResponseEntity<Void> connect(Authentication authentication, HttpSession session) {
        authorization.requireOwner(authentication);
        if (!properties.configured()) throw new IllegalStateException("Google Workspace integration is not configured");
        session.setAttribute(PortfolioLoginController.RETURN_TO_SESSION_ATTRIBUTE, "/");
        return ResponseEntity.status(302).location(URI.create("/oauth2/authorization/google-workspace")).build();
    }

    @GetMapping("/status")
    public WorkspaceStatus status(Authentication authentication) {
        authorization.requireOwner(authentication);
        return new WorkspaceStatus(properties.configured(), connection.connected(), properties.email());
    }

    public record WorkspaceStatus(boolean configured, boolean connected, String email) {}
}
