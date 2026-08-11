package com.omarabusahmoud.portfolio.guestbook.exception;

public class GuestbookForbiddenException extends RuntimeException {
    public GuestbookForbiddenException() {
        super("You cannot modify this message.");
    }
}
