package com.omarabusahmoud.portfolio.assistant.exception;

public class AssistantRateLimitException extends RuntimeException {
    public AssistantRateLimitException() {
        super("The portfolio assistant is busy. Please try again in a moment.");
    }
}
