package com.omarabusahmoud.portfolio.guestbook.dto;

import java.util.List;
import org.springframework.data.domain.Page;
import com.omarabusahmoud.portfolio.guestbook.entity.GuestbookMessageEntity;

public record GuestbookPageResponse(
        List<GuestbookMessageResponse> messages,
        int page,
        int size,
        long totalElements,
        int totalPages) {

    public static GuestbookPageResponse from(Page<GuestbookMessageEntity> result) {
        return new GuestbookPageResponse(
                result.getContent().stream().map(GuestbookMessageResponse::from).toList(),
                result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }
}
