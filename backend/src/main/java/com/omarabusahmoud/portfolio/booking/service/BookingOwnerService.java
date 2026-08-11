package com.omarabusahmoud.portfolio.booking.service;

import java.time.Clock;
import java.util.List;
import java.util.UUID;

import com.omarabusahmoud.portfolio.booking.dto.OwnerBookingResponse;
import com.omarabusahmoud.portfolio.booking.entity.BookingRequestEntity;
import com.omarabusahmoud.portfolio.booking.model.BookingStatus;
import com.omarabusahmoud.portfolio.booking.repository.BookingRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import com.omarabusahmoud.portfolio.workspace.service.GoogleWorkspaceApiService;

@Service
public class BookingOwnerService {
    private final BookingRequestRepository repository;
    private final Clock clock;
    private final GoogleWorkspaceApiService workspace;

    public BookingOwnerService(BookingRequestRepository repository, Clock clock) {
        this(repository, clock, null);
    }

    @Autowired
    public BookingOwnerService(BookingRequestRepository repository, Clock clock, GoogleWorkspaceApiService workspace) {
        this.repository = repository; this.clock = clock; this.workspace = workspace;
    }

    @Transactional(readOnly = true)
    public List<OwnerBookingResponse> list(BookingStatus status) {
        return repository.findAllByStatusOrderByStartsAtAsc(status).stream()
                .map(OwnerBookingResponse::from)
                .toList();
    }

    @Transactional
    public OwnerBookingResponse updateStatus(UUID id, BookingStatus status) {
        BookingRequestEntity booking = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking request was not found"));
        if (booking.getStatus() != BookingStatus.PENDING && status != BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Only pending booking requests can be reviewed");
        }
        if (status == BookingStatus.CONFIRMED && workspace != null) {
            GoogleWorkspaceApiService.WorkspaceBookingResult result = workspace.confirmBooking(booking);
            booking.attachWorkspaceDetails(result.calendarEventId(), result.googleMeetUrl(), clock.instant());
        }
        booking.updateStatus(status, clock.instant());
        return OwnerBookingResponse.from(repository.saveAndFlush(booking));
    }
}
