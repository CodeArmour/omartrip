package com.omarabusahmoud.portfolio.guestbook.dto;

import java.util.UUID;
import com.omarabusahmoud.portfolio.guestbook.entity.GuestbookUserEntity;

public record GuestbookAuthorResponse(UUID id, String displayName, String avatarUrl) {
    public static GuestbookAuthorResponse from(GuestbookUserEntity user) {
        return new GuestbookAuthorResponse(user.getId(), user.getDisplayName(), user.getAvatarUrl());
    }
}
