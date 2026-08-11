package com.omarabusahmoud.portfolio.workspace.service;

import java.time.Clock;
import java.util.UUID;

import com.omarabusahmoud.portfolio.workspace.config.WorkspaceGoogleProperties;
import com.omarabusahmoud.portfolio.workspace.entity.WorkspaceGoogleConnectionEntity;
import com.omarabusahmoud.portfolio.workspace.repository.WorkspaceGoogleConnectionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkspaceGoogleConnectionService {
    private final WorkspaceGoogleConnectionRepository repository;
    private final WorkspaceTokenCryptoService crypto;
    private final WorkspaceGoogleProperties properties;
    private final Clock clock;

    public WorkspaceGoogleConnectionService(WorkspaceGoogleConnectionRepository repository,
            WorkspaceTokenCryptoService crypto, WorkspaceGoogleProperties properties, Clock clock) {
        this.repository = repository; this.crypto = crypto; this.properties = properties; this.clock = clock;
    }

    @Transactional
    public void saveRefreshToken(String refreshToken) {
        if (!properties.configured()) throw new IllegalStateException("Google Workspace integration is not configured");
        String encrypted = crypto.encrypt(refreshToken);
        WorkspaceGoogleConnectionEntity connection = repository.findFirstByOrderByUpdatedAtDesc()
                .orElseGet(() -> new WorkspaceGoogleConnectionEntity(UUID.randomUUID(), properties.email(), encrypted, clock.instant()));
        connection.update(encrypted, clock.instant());
        repository.saveAndFlush(connection);
    }

    @Transactional(readOnly = true)
    public String refreshToken() {
        return repository.findFirstByOrderByUpdatedAtDesc().map(item -> crypto.decrypt(item.getEncryptedRefreshToken())).orElse(null);
    }

    @Transactional(readOnly = true)
    public boolean connected() { return repository.findFirstByOrderByUpdatedAtDesc().isPresent(); }
}
