package com.sih.inspection.inspection.dto;

import com.sih.inspection.inspection.enums.InspectionType;
import jakarta.validation.constraints.NotNull;

/**
 * Request payload for creating/requesting a new inspection.
 * Institute representatives automatically have their institute resolved from their authenticated context.
 * Administrators may optionally specify instituteId.
 */
public record CreateInspectionRequest(
        @NotNull(message = "Inspection type is required")
        InspectionType inspectionType,

        Long instituteId
) {
    public CreateInspectionRequest(InspectionType inspectionType) {
        this(inspectionType, null);
    }
}
