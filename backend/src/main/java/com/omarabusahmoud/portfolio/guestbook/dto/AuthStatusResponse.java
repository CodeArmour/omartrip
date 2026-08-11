package com.omarabusahmoud.portfolio.guestbook.dto;

public record AuthStatusResponse(boolean authenticated, boolean admin, String displayName, String avatarUrl) {
    public static AuthStatusResponse signedOut() {
        return new AuthStatusResponse(false, false, null, null);
    }
}
