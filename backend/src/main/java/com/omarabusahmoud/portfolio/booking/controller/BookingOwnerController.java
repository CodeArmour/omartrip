package com.omarabusahmoud.portfolio.booking.controller;

import java.util.List;
import java.util.UUID;

import com.omarabusahmoud.portfolio.auth.service.PortfolioAuthorizationService;
import com.omarabusahmoud.portfolio.booking.dto.OwnerBookingResponse;
import com.omarabusahmoud.portfolio.booking.model.BookingStatus;
import com.omarabusahmoud.portfolio.booking.service.BookingOwnerService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/bookings/admin")
public class BookingOwnerController {
    private final BookingOwnerService bookings;
    private final PortfolioAuthorizationService authorization;

    public BookingOwnerController(BookingOwnerService bookings, PortfolioAuthorizationService authorization) {
        this.bookings = bookings;
        this.authorization = authorization;
    }

    @GetMapping("/requests")
    public List<OwnerBookingResponse> list(
            @RequestParam(defaultValue = "PENDING") BookingStatus status,
            Authentication authentication) {
        authorization.requireOwner(authentication);
        return bookings.list(status);
    }

    @PatchMapping("/requests/{id}/confirm")
    public OwnerBookingResponse confirm(@PathVariable UUID id, Authentication authentication) {
        authorization.requireOwner(authentication);
        return bookings.updateStatus(id, BookingStatus.CONFIRMED);
    }

    @PatchMapping("/requests/{id}/reject")
    public OwnerBookingResponse reject(@PathVariable UUID id, Authentication authentication) {
        authorization.requireOwner(authentication);
        return bookings.updateStatus(id, BookingStatus.REJECTED);
    }

    @PatchMapping("/requests/{id}/cancel")
    public OwnerBookingResponse cancel(@PathVariable UUID id, Authentication authentication) {
        authorization.requireOwner(authentication);
        return bookings.updateStatus(id, BookingStatus.CANCELLED);
    }
}
