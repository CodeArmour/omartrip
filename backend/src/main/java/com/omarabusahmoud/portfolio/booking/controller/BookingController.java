package com.omarabusahmoud.portfolio.booking.controller;

import com.omarabusahmoud.portfolio.booking.dto.AvailabilityResponse;
import com.omarabusahmoud.portfolio.booking.dto.BookingResult;
import com.omarabusahmoud.portfolio.booking.dto.CreateBookingRequest;
import com.omarabusahmoud.portfolio.booking.service.BookingAvailabilityService;
import com.omarabusahmoud.portfolio.booking.service.BookingRequestService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Validated
@RestController
@RequestMapping("/api/v1/bookings")
@Tag(name = "Bookings", description = "Booking availability and pending booking requests")
public class BookingController {

    private final BookingAvailabilityService availabilityService;
    private final BookingRequestService requestService;

    public BookingController(
            BookingAvailabilityService availabilityService,
            BookingRequestService requestService) {
        this.availabilityService = availabilityService;
        this.requestService = requestService;
    }

    @GetMapping("/availability")
    @Operation(
            summary = "Get booking availability",
            description = "Returns available dates and optional 30-minute slots in Europe/Brussels.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Availability calculated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid month or date")
    })
    public AvailabilityResponse availability(
            @Parameter(description = "Month in YYYY-MM format", example = "2026-08", required = true)
            @RequestParam String month,
            @Parameter(description = "Optional date in YYYY-MM-DD format", example = "2026-08-11")
            @RequestParam(required = false) String date) {
        return availabilityService.getAvailability(month, date);
    }

    @PostMapping("/requests")
    @Operation(
            summary = "Create a pending booking request",
            description = "Revalidates the selected slot and persists a pending request atomically.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Pending booking request created"),
            @ApiResponse(responseCode = "400", description = "Request validation failed"),
            @ApiResponse(responseCode = "409", description = "Selected slot is no longer available")
    })
    public ResponseEntity<BookingResult> create(@Valid @RequestBody CreateBookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(requestService.create(request));
    }
}
