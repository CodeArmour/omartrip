package com.omarabusahmoud.portfolio.contact.entity;

import java.time.Instant;
import java.util.UUID;
import com.omarabusahmoud.portfolio.contact.model.ContactInquiryStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "contact_inquiries")
public class ContactInquiryEntity {
    @Id
    private UUID id;
    @Column(name = "full_name", nullable = false, length = 80)
    private String fullName;
    @Column(nullable = false, length = 254)
    private String email;
    @Column(nullable = false, length = 120)
    private String subject;
    @Column(nullable = false, length = 2000)
    private String message;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private ContactInquiryStatus status;
    @Column(name = "idempotency_key", nullable = false, unique = true, length = 80)
    private String idempotencyKey;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected ContactInquiryEntity() { }

    public ContactInquiryEntity(UUID id, String fullName, String email, String subject,
            String message, String idempotencyKey, Instant createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.subject = subject;
        this.message = message;
        this.status = ContactInquiryStatus.NEW;
        this.idempotencyKey = idempotencyKey;
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
    }

    public UUID getId() { return id; }
    public ContactInquiryStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
