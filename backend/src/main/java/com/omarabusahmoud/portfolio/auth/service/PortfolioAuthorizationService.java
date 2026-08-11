package com.omarabusahmoud.portfolio.auth.service;

import java.util.List;
import java.util.Locale;

import com.omarabusahmoud.portfolio.auth.config.PortfolioAuthProperties;
import com.omarabusahmoud.portfolio.auth.exception.OwnerAccessRequiredException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class PortfolioAuthorizationService {
    private final PortfolioAuthProperties properties;

    public PortfolioAuthorizationService(PortfolioAuthProperties properties) {
        this.properties = properties;
    }

    public void requireOwner(Authentication authentication) {
        if (!isOwner(authentication)) throw new OwnerAccessRequiredException();
    }

    public boolean isOwner(Authentication authentication) {
        if (!(authentication instanceof OAuth2AuthenticationToken token)
                || !(authentication.getPrincipal() instanceof OAuth2User principal)) return false;

        String provider = token.getAuthorizedClientRegistrationId().toLowerCase(Locale.ROOT);
        return switch (provider) {
            case "github" -> matches(principal.getAttribute("login"), properties.ownerGithubLogins());
            case "google", "google-workspace" -> matches(principal.getAttribute("email"), properties.ownerGoogleEmails());
            default -> false;
        };
    }

    private boolean matches(Object value, List<String> allowedValues) {
        if (value == null) return false;
        String normalized = value.toString().trim().toLowerCase(Locale.ROOT);
        return allowedValues.stream()
                .map(item -> item.trim().toLowerCase(Locale.ROOT))
                .anyMatch(normalized::equals);
    }
}
