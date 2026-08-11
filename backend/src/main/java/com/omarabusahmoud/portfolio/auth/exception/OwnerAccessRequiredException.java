package com.omarabusahmoud.portfolio.auth.exception;

public class OwnerAccessRequiredException extends RuntimeException {
    public OwnerAccessRequiredException() {
        super("Owner access is required for this action.");
    }
}
