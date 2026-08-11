package com.omarabusahmoud.portfolio.booking.exception;

public class BookingConflictException extends RuntimeException {
    public BookingConflictException() {
        super("That time is no longer available. Please select another slot.");
    }
}
