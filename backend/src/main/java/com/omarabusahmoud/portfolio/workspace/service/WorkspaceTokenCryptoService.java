package com.omarabusahmoud.portfolio.workspace.service;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import com.omarabusahmoud.portfolio.workspace.config.WorkspaceGoogleProperties;
import org.springframework.stereotype.Service;

@Service
public class WorkspaceTokenCryptoService {
    private static final int IV_BYTES = 12;
    private static final int TAG_BITS = 128;
    private final WorkspaceGoogleProperties properties;
    private final SecureRandom random = new SecureRandom();

    public WorkspaceTokenCryptoService(WorkspaceGoogleProperties properties) { this.properties = properties; }

    public String encrypt(String value) {
        try {
            byte[] iv = new byte[IV_BYTES]; random.nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key(), new GCMParameterSpec(TAG_BITS, iv));
            byte[] encrypted = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
            byte[] payload = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, payload, 0, iv.length);
            System.arraycopy(encrypted, 0, payload, iv.length, encrypted.length);
            return Base64.getEncoder().encodeToString(payload);
        } catch (GeneralSecurityException exception) { throw new IllegalStateException("Workspace token encryption failed", exception); }
    }

    public String decrypt(String value) {
        try {
            byte[] payload = Base64.getDecoder().decode(value);
            byte[] iv = java.util.Arrays.copyOf(payload, IV_BYTES);
            byte[] encrypted = java.util.Arrays.copyOfRange(payload, IV_BYTES, payload.length);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(TAG_BITS, iv));
            return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException exception) { throw new IllegalStateException("Workspace token decryption failed", exception); }
    }

    private SecretKeySpec key() {
        try {
            byte[] bytes = Base64.getDecoder().decode(properties.encryptionKey());
            if (bytes.length != 32) throw new IllegalStateException("GOOGLE_WORKSPACE_ENCRYPTION_KEY must decode to 32 bytes");
            return new SecretKeySpec(bytes, "AES");
        } catch (IllegalArgumentException exception) { throw new IllegalStateException("GOOGLE_WORKSPACE_ENCRYPTION_KEY must be base64", exception); }
    }
}
