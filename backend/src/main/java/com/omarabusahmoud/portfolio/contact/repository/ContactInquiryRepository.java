package com.omarabusahmoud.portfolio.contact.repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import com.omarabusahmoud.portfolio.contact.entity.ContactInquiryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactInquiryRepository extends JpaRepository<ContactInquiryEntity, UUID> {
    Optional<ContactInquiryEntity> findByIdempotencyKey(String idempotencyKey);
    long countByEmailAndCreatedAtAfter(String email, Instant createdAfter);
}
