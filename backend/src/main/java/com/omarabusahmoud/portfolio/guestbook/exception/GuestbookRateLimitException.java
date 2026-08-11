package com.omarabusahmoud.portfolio.guestbook.exception;

public class GuestbookRateLimitException extends RuntimeException {
    public GuestbookRateLimitException(String message) {
        super(message);
    }
}
