package com.sih.inspection.assignment.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Request payload for assigning an inspector to an institute.
 */
public record CreateAssignmentRequest(
        @NotNull(message = "Inspector ID is required")
        Long inspectorId,

        @NotNull(message = "Institute ID is required")
        Long instituteId
) {}
