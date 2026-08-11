package com.omarabusahmoud.portfolio.contact.exception;

public class ContactRateLimitException extends RuntimeException {
    public ContactRateLimitException() {
        super("You are sending messages too quickly. Please wait before trying again.");
    }
}
