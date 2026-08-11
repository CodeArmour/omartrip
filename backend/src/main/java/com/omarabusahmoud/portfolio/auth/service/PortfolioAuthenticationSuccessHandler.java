package com.omarabusahmoud.portfolio.auth.service;

import java.io.IOException;

import com.omarabusahmoud.portfolio.auth.config.PortfolioAuthProperties;
import com.omarabusahmoud.portfolio.auth.controller.PortfolioLoginController;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import com.omarabusahmoud.portfolio.workspace.service.WorkspaceGoogleConnectionService;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.ObjectProvider;

@Component
public class PortfolioAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final PortfolioAuthProperties properties;
    private final ObjectProvider<OAuth2AuthorizedClientService> authorizedClients;
    private final WorkspaceGoogleConnectionService workspaceConnection;

    public PortfolioAuthenticationSuccessHandler(PortfolioAuthProperties properties,
            ObjectProvider<OAuth2AuthorizedClientService> authorizedClients, WorkspaceGoogleConnectionService workspaceConnection) {
        this.properties = properties; this.authorizedClients = authorizedClients; this.workspaceConnection = workspaceConnection;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        Object requestedPath = request.getSession().getAttribute(PortfolioLoginController.RETURN_TO_SESSION_ATTRIBUTE);
        request.getSession().removeAttribute(PortfolioLoginController.RETURN_TO_SESSION_ATTRIBUTE);
        if (authentication instanceof org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken token
                && token.getAuthorizedClientRegistrationId().equals("google-workspace")) {
            OAuth2AuthorizedClientService service = authorizedClients.getIfAvailable();
            if (service != null) {
                OAuth2AuthorizedClient client = service.loadAuthorizedClient("google-workspace", authentication.getName());
                if (client != null && client.getRefreshToken() != null) workspaceConnection.saveRefreshToken(client.getRefreshToken().getTokenValue());
            }
        }
        String path = requestedPath instanceof String value && value.startsWith("/") && !value.startsWith("//")
                ? value
                : "/guestbook";
        response.sendRedirect(properties.frontendBaseUrl() + path);
    }
}
