package com.omarabusahmoud.portfolio.common.dto;

import java.util.Map;

public record ApiError(String status, String message, Map<String, String> fieldErrors) {
}
