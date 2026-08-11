package com.omarabusahmoud.portfolio.guestbook.service;

import java.time.Clock;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import com.omarabusahmoud.portfolio.guestbook.entity.GuestbookUserEntity;
import com.omarabusahmoud.portfolio.guestbook.repository.GuestbookUserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GuestbookUserService {
    private final GuestbookUserRepository repository;
    private final Clock clock;

    public GuestbookUserService(GuestbookUserRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Transactional
    public GuestbookUserEntity resolve(Authentication authentication) {
        if (!(authentication instanceof OAuth2AuthenticationToken token)
                || !(authentication.getPrincipal() instanceof OAuth2User principal)) {
            throw new IllegalArgumentException("A supported OAuth identity is required");
        }
        String provider = token.getAuthorizedClientRegistrationId().toLowerCase(Locale.ROOT);
        Map<String, Object> attributes = principal.getAttributes();
        String providerId = requiredAttribute(attributes, provider.equals("github") ? "id" : "sub");
        String attributeDisplayName = firstText(attributes, "name", "login");
        String displayName = attributeDisplayName == null ? "Guestbook visitor" : attributeDisplayName;
        String avatarUrl = firstText(attributes, "avatar_url", "picture");
        Instant now = clock.instant();

        GuestbookUserEntity user = repository.findByProviderAndProviderId(provider, providerId)
                .orElseGet(() -> new GuestbookUserEntity(
                        UUID.randomUUID(), provider, providerId, displayName, avatarUrl, now));
        user.updateProfile(displayName, avatarUrl, now);
        return repository.saveAndFlush(user);
    }

    private String requiredAttribute(Map<String, Object> attributes, String name) {
        Object value = attributes.get(name);
        if (value == null || value.toString().isBlank()) {
            throw new IllegalArgumentException("OAuth identity is missing a stable identifier");
        }
        return value.toString();
    }

    private String firstText(Map<String, Object> attributes, String... names) {
        for (String name : names) {
            Object value = attributes.get(name);
            if (value != null && !value.toString().isBlank()) return value.toString().trim();
        }
        return null;
    }
}
