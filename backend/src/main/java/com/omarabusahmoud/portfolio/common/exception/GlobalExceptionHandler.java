package com.omarabusahmoud.portfolio.common.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import com.omarabusahmoud.portfolio.booking.exception.BookingConflictException;
import com.omarabusahmoud.portfolio.auth.exception.OwnerAccessRequiredException;
import com.omarabusahmoud.portfolio.assistant.exception.AssistantRateLimitException;
import com.omarabusahmoud.portfolio.common.dto.ApiError;
import com.omarabusahmoud.portfolio.contact.exception.ContactRateLimitException;
import com.omarabusahmoud.portfolio.guestbook.exception.GuestbookForbiddenException;
import com.omarabusahmoud.portfolio.guestbook.exception.GuestbookAlreadyPostedException;
import com.omarabusahmoud.portfolio.guestbook.exception.GuestbookMessageNotFoundException;
import com.omarabusahmoud.portfolio.guestbook.exception.GuestbookRateLimitException;
import com.omarabusahmoud.portfolio.workspace.exception.WorkspaceIntegrationException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<ApiError> uploadTooLarge(MaxUploadSizeExceededException exception) {
        log.warn("Multipart upload rejected because it exceeded configured limits. message={}", exception.getMessage());
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(
                new ApiError("payload_too_large", "This upload is too large. Please use a smaller file.", Map.of()));
    }

    @ExceptionHandler(MultipartException.class)
    ResponseEntity<ApiError> multipart(MultipartException exception) {
        log.warn("Multipart upload could not be parsed. message={}", exception.getMessage());
        return ResponseEntity.badRequest().body(
                new ApiError("invalid_upload", "The uploaded file could not be read. Please try a smaller ZIP/RAR file.", Map.of()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ApiError> responseStatus(ResponseStatusException exception) {
        String code = switch (exception.getStatusCode().value()) {
            case 400 -> "invalid";
            case 401 -> "unauthenticated";
            case 403 -> "forbidden";
            case 404 -> "not_found";
            case 413 -> "payload_too_large";
            case 415 -> "unsupported_media_type";
            case 502 -> "provider_error";
            case 503 -> "service_unavailable";
            default -> "request_failed";
        };
        String message = exception.getReason() == null || exception.getReason().isBlank()
                ? "The request could not be completed."
                : exception.getReason();
        return ResponseEntity.status(exception.getStatusCode()).body(
                new ApiError(code, message, Map.of()));
    }

    @ExceptionHandler(WorkspaceIntegrationException.class)
    ResponseEntity<ApiError> workspace(WorkspaceIntegrationException exception) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                new ApiError("workspace_unavailable", exception.getMessage(), Map.of()));
    }

    @ExceptionHandler(AssistantRateLimitException.class)
    ResponseEntity<ApiError> assistantRateLimit(AssistantRateLimitException exception) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(
                new ApiError("rate_limited", exception.getMessage(), Map.of()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validation(MethodArgumentNotValidException exception) {
        Map<String, String> errors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error ->
                errors.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(
                new ApiError("invalid", "Please review the highlighted fields.", errors));
    }

    @ExceptionHandler(BookingConflictException.class)
    ResponseEntity<ApiError> conflict(BookingConflictException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new ApiError("conflict", exception.getMessage(), Map.of()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ApiError> invalid(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(
                new ApiError("invalid", exception.getMessage(), Map.of()));
    }

    @ExceptionHandler(ContactRateLimitException.class)
    ResponseEntity<ApiError> rateLimit(ContactRateLimitException exception) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(
                new ApiError("rate_limited", exception.getMessage(), Map.of()));
    }

    @ExceptionHandler(GuestbookRateLimitException.class)
    ResponseEntity<ApiError> guestbookRateLimit(GuestbookRateLimitException exception) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(
                new ApiError("rate_limited", exception.getMessage(), Map.of()));
    }

    @ExceptionHandler(GuestbookForbiddenException.class)
    ResponseEntity<ApiError> forbidden(GuestbookForbiddenException exception) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                new ApiError("forbidden", exception.getMessage(), Map.of()));
    }

    @ExceptionHandler(OwnerAccessRequiredException.class)
    ResponseEntity<ApiError> ownerForbidden(OwnerAccessRequiredException exception) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                new ApiError("owner_required", exception.getMessage(), Map.of()));
    }

    @ExceptionHandler(GuestbookMessageNotFoundException.class)
    ResponseEntity<ApiError> notFound(GuestbookMessageNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ApiError("not_found", exception.getMessage(), Map.of()));
    }

    @ExceptionHandler(GuestbookAlreadyPostedException.class)
    ResponseEntity<ApiError> alreadyPosted(GuestbookAlreadyPostedException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new ApiError("already_posted", exception.getMessage(), Map.of()));
    }
}
