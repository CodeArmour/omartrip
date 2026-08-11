package com.omarabusahmoud.portfolio.auth.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;

import com.omarabusahmoud.portfolio.auth.config.PortfolioAuthProperties;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2UserAuthority;

class PortfolioAuthorizationServiceTests {

    private final PortfolioAuthorizationService service = new PortfolioAuthorizationService(
            new PortfolioAuthProperties(
                    "http://localhost:3000",
                    List.of("CodeArmour"),
                    List.of("omarcode.business@gmail.com")));

    @Test
    void recognizesTheConfiguredGithubOwner() {
        assertThat(service.isOwner(authentication("github", Map.of("login", "codearmour"), "login"))).isTrue();
    }

    @Test
    void recognizesTheConfiguredGoogleOwner() {
        assertThat(service.isOwner(authentication(
                "google", Map.of("sub", "123", "email", "OMARCODE.BUSINESS@GMAIL.COM"), "sub"))).isTrue();
    }

    @Test
    void doesNotGrantOwnerAccessToAnotherSignedInUser() {
        assertThat(service.isOwner(authentication("github", Map.of("login", "visitor"), "login"))).isFalse();
    }

    private OAuth2AuthenticationToken authentication(
            String provider,
            Map<String, Object> attributes,
            String nameAttribute) {
        var authority = new OAuth2UserAuthority(attributes);
        var principal = new DefaultOAuth2User(List.of(authority), attributes, nameAttribute);
        return new OAuth2AuthenticationToken(principal, principal.getAuthorities(), provider);
    }
}
