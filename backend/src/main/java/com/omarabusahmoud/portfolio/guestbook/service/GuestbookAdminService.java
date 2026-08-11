package com.omarabusahmoud.portfolio.guestbook.service;

import com.omarabusahmoud.portfolio.auth.service.PortfolioAuthorizationService;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class GuestbookAdminService {
    private final PortfolioAuthorizationService authorization;

    public GuestbookAdminService(PortfolioAuthorizationService authorization) {
        this.authorization = authorization;
    }

    public void requireAdmin(Authentication authentication) {
        authorization.requireOwner(authentication);
    }

    public boolean isAdmin(Authentication authentication) {
        return authorization.isOwner(authentication);
    }
}
