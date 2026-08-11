package com.omarabusahmoud.portfolio.guestbook.controller;

import java.util.ArrayList;
import java.util.List;
import com.omarabusahmoud.portfolio.guestbook.dto.AuthProviderResponse;
import com.omarabusahmoud.portfolio.guestbook.dto.AuthStatusResponse;
import com.omarabusahmoud.portfolio.guestbook.dto.CsrfResponse;
import com.omarabusahmoud.portfolio.guestbook.service.GuestbookAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Guestbook OAuth session discovery")
public class GuestbookAuthController {
    private final ObjectProvider<ClientRegistrationRepository> registrations;
    private final GuestbookAdminService adminService;

    public GuestbookAuthController(
            ObjectProvider<ClientRegistrationRepository> registrations,
            GuestbookAdminService adminService) {
        this.registrations = registrations;
        this.adminService = adminService;
    }

    @GetMapping("/providers")
    @Operation(summary = "List configured OAuth providers")
    public List<AuthProviderResponse> providers() {
        ClientRegistrationRepository repository = registrations.getIfAvailable();
        if (!(repository instanceof Iterable<?> iterable)) return List.of();
        List<AuthProviderResponse> result = new ArrayList<>();
        for (Object item : iterable) {
            ClientRegistration registration = (ClientRegistration) item;
            String id = registration.getRegistrationId();
            if (!id.equalsIgnoreCase("github") && !id.equalsIgnoreCase("google")) continue;
            result.add(new AuthProviderResponse(id, "/api/v1/auth/login/" + id));
        }
        return List.copyOf(result);
    }

    @GetMapping("/me")
    @Operation(summary = "Get the current OAuth session")
    public AuthStatusResponse me(Authentication authentication) {
        if (!(authentication instanceof OAuth2AuthenticationToken)
                || !(authentication.getPrincipal() instanceof OAuth2User principal)) {
            return AuthStatusResponse.signedOut();
        }
        String displayName = firstText(principal, "name", "login");
        String avatarUrl = firstText(principal, "avatar_url", "picture");
        return new AuthStatusResponse(true, adminService.isAdmin(authentication), displayName, avatarUrl);
    }

    @GetMapping("/csrf")
    @Operation(summary = "Get CSRF metadata for authenticated mutations")
    public CsrfResponse csrf(CsrfToken token) {
        return new CsrfResponse(token.getToken(), token.getHeaderName(), token.getParameterName());
    }

    private String firstText(OAuth2User principal, String... names) {
        for (String name : names) {
            Object value = principal.getAttributes().get(name);
            if (value != null && !value.toString().isBlank()) return value.toString().trim();
        }
        return null;
    }
}
