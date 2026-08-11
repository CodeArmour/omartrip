package com.omarabusahmoud.portfolio.guestbook.controller;

import java.util.UUID;
import com.omarabusahmoud.portfolio.guestbook.dto.GuestbookMessageResponse;
import com.omarabusahmoud.portfolio.guestbook.dto.GuestbookPageResponse;
import com.omarabusahmoud.portfolio.guestbook.service.GuestbookAdminService;
import com.omarabusahmoud.portfolio.guestbook.service.GuestbookMessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/guestbook/moderation/messages")
@Tag(name = "Guestbook moderation", description = "Owner-only message review")
public class GuestbookModerationController {
    private final GuestbookMessageService messageService;
    private final GuestbookAdminService adminService;

    public GuestbookModerationController(
            GuestbookMessageService messageService,
            GuestbookAdminService adminService) {
        this.messageService = messageService;
        this.adminService = adminService;
    }

    @GetMapping
    @Operation(summary = "List pending messages for review")
    public GuestbookPageResponse pending(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        adminService.requireAdmin(authentication);
        return messageService.listPending(page, size);
    }

    @PatchMapping("/{id}/approve")
    @Operation(summary = "Approve and publish a pending message")
    public GuestbookMessageResponse approve(@PathVariable UUID id, Authentication authentication) {
        adminService.requireAdmin(authentication);
        return messageService.approve(id);
    }

    @PatchMapping("/{id}/hide")
    @Operation(summary = "Hide a reviewed message")
    public GuestbookMessageResponse hide(@PathVariable UUID id, Authentication authentication) {
        adminService.requireAdmin(authentication);
        return messageService.moderateHide(id);
    }
}
