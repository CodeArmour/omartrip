package com.omarabusahmoud.portfolio.guestbook.dto;

import java.time.Instant;
import java.util.UUID;
import com.omarabusahmoud.portfolio.guestbook.entity.GuestbookMessageEntity;

public record GuestbookMessageResponse(
        UUID id,
        String content,
        String status,
        Instant createdAt,
        Instant updatedAt,
        boolean edited,
        GuestbookAuthorResponse user) {

    public static GuestbookMessageResponse from(GuestbookMessageEntity message) {
        return new GuestbookMessageResponse(
                message.getId(), message.getContent(), message.getStatus().name().toLowerCase(),
                message.getCreatedAt(), message.getUpdatedAt(),
                message.getUpdatedAt().isAfter(message.getCreatedAt()),
                GuestbookAuthorResponse.from(message.getUser()));
    }
}
