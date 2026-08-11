package com.omarabusahmoud.portfolio.guestbook.dto;

public record CsrfResponse(String token, String headerName, String parameterName) {
}
