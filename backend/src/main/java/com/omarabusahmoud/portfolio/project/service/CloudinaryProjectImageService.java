package com.omarabusahmoud.portfolio.project.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.util.HexFormat;
import java.util.Set;

import com.omarabusahmoud.portfolio.project.config.CloudinaryProperties;
import com.omarabusahmoud.portfolio.project.dto.CloudinaryUploadApiResponse;
import com.omarabusahmoud.portfolio.project.dto.ProjectImageUploadResponse;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CloudinaryProjectImageService {
    private static final long MAX_BYTES = 10L * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/avif");
    private final CloudinaryProperties properties;
    private final Clock clock;
    private final RestClient client = RestClient.create();

    public CloudinaryProjectImageService(CloudinaryProperties properties, Clock clock) {
        this.properties = properties;
        this.clock = clock;
    }

    public ProjectImageUploadResponse upload(MultipartFile file) {
        return upload(file, properties.safeFolder());
    }

    public ProjectImageUploadResponse uploadSkill(MultipartFile file) {
        return upload(file, properties.safeSkillFolder());
    }

    public ProjectImageUploadResponse uploadProfile(MultipartFile file) {
        return upload(file, properties.safeProfileFolder());
    }

    private ProjectImageUploadResponse upload(MultipartFile file, String folder) {
        validate(file);
        if (!properties.configured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Cloudinary image uploads are not configured");
        }
        long timestamp = clock.instant().getEpochSecond();
        String signature = sha1("folder=" + folder + "&timestamp=" + timestamp + properties.apiSecret());
        try {
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override public String getFilename() { return safeFilename(file.getOriginalFilename()); }
            };
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", resource);
            body.add("api_key", properties.apiKey());
            body.add("timestamp", Long.toString(timestamp));
            body.add("folder", folder);
            body.add("signature", signature);
            CloudinaryUploadApiResponse uploaded = client.post()
                    .uri("https://api.cloudinary.com/v1_1/{cloudName}/image/upload", properties.cloudName())
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(CloudinaryUploadApiResponse.class);
            if (uploaded == null || uploaded.secureUrl() == null || uploaded.publicId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cloudinary returned an incomplete upload response");
            }
            return new ProjectImageUploadResponse(uploaded.secureUrl(), uploaded.publicId(), uploaded.width(), uploaded.height());
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The image could not be uploaded", exception);
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose an image to upload");
        if (file.getSize() > MAX_BYTES) throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Images must be 10 MB or smaller");
        if (!ALLOWED_TYPES.contains(file.getContentType())) throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Use a JPEG, PNG, WebP, or AVIF image");
    }

    private String safeFilename(String filename) {
        if (filename == null || filename.isBlank()) return "project-image";
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String sha1(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-1").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-1 is unavailable", exception);
        }
    }
}
