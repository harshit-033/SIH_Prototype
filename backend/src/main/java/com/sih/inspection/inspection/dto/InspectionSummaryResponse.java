package com.sih.inspection.inspection.dto;

import com.sih.inspection.inspection.entity.Inspection;
import com.sih.inspection.inspection.enums.InspectionStatus;
import com.sih.inspection.inspection.enums.InspectionType;

import java.time.Instant;
import java.util.UUID;

/**
 * Lightweight summary DTO for high-performance dashboard tables and reporting lists.
 */
public record InspectionSummaryResponse(
        UUID inspectionId,
        String inspectionNumber,
        String instituteName,
        String instituteCode,
        InspectionType inspectionType,
        InspectionStatus status,
        Double finalScore,
        Instant requestedAt,
        Instant completedAt
) {
    public static InspectionSummaryResponse from(Inspection inspection) {
        if (inspection == null) {
            return null;
        }

        Double score = (inspection.getResult() != null) ? inspection.getResult().getFinalScore() : null;

        return new InspectionSummaryResponse(
                inspection.getId(),
                inspection.getInspectionNumber(),
                inspection.getInstitute() != null ? inspection.getInstitute().getName() : null,
                inspection.getInstitute() != null ? inspection.getInstitute().getCode() : null,
                inspection.getInspectionType(),
                inspection.getStatus(),
                score,
                inspection.getRequestedAt(),
                inspection.getCompletedAt()
        );
    }
}
