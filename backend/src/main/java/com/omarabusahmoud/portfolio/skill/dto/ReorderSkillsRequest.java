package com.omarabusahmoud.portfolio.skill.dto;

import java.util.List;
import java.util.UUID;
import jakarta.validation.constraints.NotEmpty;

public record ReorderSkillsRequest(@NotEmpty List<UUID> skillIds) {}
