package com.omarabusahmoud.portfolio.guestbook.exception;

public class GuestbookMessageNotFoundException extends RuntimeException {
    public GuestbookMessageNotFoundException() {
        super("Guestbook message not found.");
    }
}
