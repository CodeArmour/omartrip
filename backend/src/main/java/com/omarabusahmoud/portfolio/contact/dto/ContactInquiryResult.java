package com.omarabusahmoud.portfolio.contact.dto;

import java.time.Instant;
import java.util.UUID;
import com.omarabusahmoud.portfolio.contact.entity.ContactInquiryEntity;

public record ContactInquiryResult(UUID id, String status, Instant receivedAt, String message) {
    public static ContactInquiryResult received(ContactInquiryEntity inquiry) {
        return new ContactInquiryResult(
                inquiry.getId(), inquiry.getStatus().name().toLowerCase(), inquiry.getCreatedAt(),
                "Your message has been received.");
    }
}
