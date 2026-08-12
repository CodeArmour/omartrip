package com.omarabusahmoud.portfolio.blog.dto;

import com.omarabusahmoud.portfolio.guestbook.entity.GuestbookUserEntity;

public record BlogAuthorResponse(String displayName, String avatarUrl) {
    public static BlogAuthorResponse from(GuestbookUserEntity user) {
        return new BlogAuthorResponse(user.getDisplayName(), user.getAvatarUrl());
    }
}
