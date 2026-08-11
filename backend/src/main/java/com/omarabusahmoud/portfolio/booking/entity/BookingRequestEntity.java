package com.omarabusahmoud.portfolio.booking.entity;

import java.time.Instant;
import java.util.UUID;

import com.omarabusahmoud.portfolio.booking.model.BookingStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "booking_requests")
public class BookingRequestEntity {

    @Id
    private UUID id;

    @Column(name = "starts_at", nullable = false)
    private Instant startsAt;

    @Column(name = "ends_at", nullable = false)
    private Instant endsAt;

    @Column(name = "full_name", nullable = false, length = 80)
    private String fullName;

    @Column(nullable = false, length = 254)
    private String email;

    @Column(nullable = false, length = 300)
    private String topic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private BookingStatus status;

    @Column(name = "idempotency_key", nullable = false, unique = true, length = 80)
    private String idempotencyKey;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "calendar_event_id", length = 255)
    private String calendarEventId;

    @Column(name = "google_meet_url", length = 500)
    private String googleMeetUrl;

    protected BookingRequestEntity() {
    }

    public BookingRequestEntity(
            UUID id,
            Instant startsAt,
            Instant endsAt,
            String fullName,
            String email,
            String topic,
            String idempotencyKey,
            Instant createdAt) {
        this.id = id;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.fullName = fullName;
        this.email = email;
        this.topic = topic;
        this.status = BookingStatus.PENDING;
        this.idempotencyKey = idempotencyKey;
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
    }

    public UUID getId() { return id; }
    public Instant getStartsAt() { return startsAt; }
    public Instant getEndsAt() { return endsAt; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getTopic() { return topic; }
    public BookingStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public String getCalendarEventId() { return calendarEventId; }
    public String getGoogleMeetUrl() { return googleMeetUrl; }

    public void attachWorkspaceDetails(String eventId, String meetUrl, Instant updatedAt) {
        this.calendarEventId = eventId;
        this.googleMeetUrl = meetUrl;
        this.updatedAt = updatedAt;
    }

    public void updateStatus(BookingStatus status, Instant updatedAt) {
        this.status = status;
        this.updatedAt = updatedAt;
    }
}
