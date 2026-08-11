package com.omarabusahmoud.portfolio.project.dto;

import java.util.List;
import java.util.UUID;
import jakarta.validation.constraints.NotEmpty;

public record ReorderProjectsRequest(@NotEmpty List<UUID> projectIds) {}
