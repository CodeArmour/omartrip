package com.omarabusahmoud.portfolio.guestbook.repository;

import java.util.Optional;
import java.util.UUID;
import com.omarabusahmoud.portfolio.guestbook.entity.GuestbookUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GuestbookUserRepository extends JpaRepository<GuestbookUserEntity, UUID> {
    Optional<GuestbookUserEntity> findByProviderAndProviderId(String provider, String providerId);
}
