package com.omarabusahmoud.portfolio.auth.controller;

import java.net.URI;
import java.util.Locale;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class PortfolioLoginController {
    public static final String RETURN_TO_SESSION_ATTRIBUTE = "portfolio.auth.return-to";

    private final ObjectProvider<ClientRegistrationRepository> registrations;

    public PortfolioLoginController(ObjectProvider<ClientRegistrationRepository> registrations) {
        this.registrations = registrations;
    }

    @GetMapping("/login/{provider}")
    public ResponseEntity<Void> login(
            @PathVariable String provider,
            @RequestParam(required = false) String returnTo,
            HttpSession session) {
        String registrationId = provider.toLowerCase(Locale.ROOT);
        if (!isConfigured(registrationId)) throw new IllegalArgumentException("That sign-in provider is unavailable");
        session.setAttribute(RETURN_TO_SESSION_ATTRIBUTE, safeReturnTo(returnTo));
        return ResponseEntity.status(302)
                .location(URI.create("/oauth2/authorization/" + registrationId))
                .build();
    }

    private boolean isConfigured(String provider) {
        ClientRegistrationRepository repository = registrations.getIfAvailable();
        if (!(repository instanceof Iterable<?> iterable)) return false;
        for (Object item : iterable) {
            if (((ClientRegistration) item).getRegistrationId().equalsIgnoreCase(provider)) return true;
        }
        return false;
    }

    private String safeReturnTo(String returnTo) {
        if (returnTo == null || !returnTo.startsWith("/") || returnTo.startsWith("//")) return "/guestbook";
        return returnTo;
    }
}
