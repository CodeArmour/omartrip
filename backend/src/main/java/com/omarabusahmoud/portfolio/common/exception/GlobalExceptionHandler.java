package com.omarabusahmoud.portfolio.common.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

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
