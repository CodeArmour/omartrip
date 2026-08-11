package com.omarabusahmoud.portfolio.guestbook.exception;

public class GuestbookAlreadyPostedException extends RuntimeException {
    public GuestbookAlreadyPostedException() {
        super("You have already left an active message.");
    }
}
