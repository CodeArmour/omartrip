package com.omarabusahmoud.portfolio.contact.controller;

import com.omarabusahmoud.portfolio.contact.dto.ContactInquiryResult;
import com.omarabusahmoud.portfolio.contact.dto.CreateContactInquiryRequest;
import com.omarabusahmoud.portfolio.contact.service.ContactInquiryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/contact-inquiries")
@Tag(name = "Contact", description = "Portfolio contact inquiries")
public class ContactInquiryController {
    private final ContactInquiryService service;

    public ContactInquiryController(ContactInquiryService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Create a contact inquiry", description = "Validates and persists a new contact inquiry for later review.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Inquiry received"),
            @ApiResponse(responseCode = "400", description = "Request validation failed"),
            @ApiResponse(responseCode = "429", description = "Submission limit exceeded")
    })
    public ResponseEntity<ContactInquiryResult> create(@Valid @RequestBody CreateContactInquiryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }
}
