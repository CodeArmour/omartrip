package com.omarabusahmoud.portfolio.guestbook.controller;

import java.util.UUID;
import com.omarabusahmoud.portfolio.guestbook.dto.CreateGuestbookMessageRequest;
import com.omarabusahmoud.portfolio.guestbook.dto.GuestbookMessageResponse;
import com.omarabusahmoud.portfolio.guestbook.dto.GuestbookPageResponse;
import com.omarabusahmoud.portfolio.guestbook.dto.UpdateGuestbookMessageRequest;
import com.omarabusahmoud.portfolio.guestbook.entity.GuestbookUserEntity;
import com.omarabusahmoud.portfolio.guestbook.service.GuestbookMessageService;
import com.omarabusahmoud.portfolio.guestbook.service.GuestbookUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/guestbook/messages")
@Tag(name = "Guestbook", description = "Public community-wall messages")
public class GuestbookController {
    private final GuestbookMessageService messageService;
    private final GuestbookUserService userService;

    public GuestbookController(GuestbookMessageService messageService, GuestbookUserService userService) {
        this.messageService = messageService;
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "List visible guestbook messages")
    public GuestbookPageResponse list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return messageService.listVisible(page, size);
    }

    @PostMapping
    @Operation(summary = "Post an authenticated guestbook message")
    @ApiResponse(responseCode = "201", description = "Message added")
    public ResponseEntity<GuestbookMessageResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateGuestbookMessageRequest request) {
        GuestbookUserEntity user = userService.resolve(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(messageService.create(user, request.content()));
    }

    @GetMapping("/mine")
    @Operation(summary = "Get your active guestbook message")
    public ResponseEntity<GuestbookMessageResponse> mine(Authentication authentication) {
        GuestbookMessageResponse message = messageService.findMine(userService.resolve(authentication));
        return message == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(message);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Edit your guestbook message")
    public GuestbookMessageResponse edit(
            @PathVariable UUID id,
            Authentication authentication,
            @Valid @RequestBody UpdateGuestbookMessageRequest request) {
        return messageService.edit(id, userService.resolve(authentication), request.content());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Hide your guestbook message")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication authentication) {
        messageService.delete(id, userService.resolve(authentication));
        return ResponseEntity.noContent().build();
    }
}
