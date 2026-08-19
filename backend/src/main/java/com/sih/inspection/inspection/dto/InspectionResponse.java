package com.sih.inspection.inspection.dto;

import com.sih.inspection.assignment.dto.InstituteSummaryResponse;
import com.sih.inspection.inspection.entity.Inspection;
import com.sih.inspection.inspection.enums.InspectionStatus;
import com.sih.inspection.inspection.enums.InspectionType;

import java.time.Instant;
import java.util.UUID;

/**
 * Standard response DTO for an Inspection.
 */
public record InspectionResponse(
        UUID id,
        String inspectionNumber,
        InstituteSummaryResponse institute,
        InspectionType inspectionType,
        InspectionStatus status,
        Instant requestedAt,
        Instant startedAt,
        Instant completedAt,
        Instant cancelledAt,
        String failureReason,
        boolean hasResult,
        Double finalScore
) {
    public static InspectionResponse from(Inspection inspection) {
        if (inspection == null) {
            return null;
        }

        Double score = (inspection.getResult() != null) ? inspection.getResult().getFinalScore() : null;
        boolean hasRes = (inspection.getResult() != null);

        return new InspectionResponse(
                inspection.getId(),
                inspection.getInspectionNumber(),
                InstituteSummaryResponse.from(inspection.getInstitute()),
                inspection.getInspectionType(),
                inspection.getStatus(),
                inspection.getRequestedAt(),
                inspection.getStartedAt(),
                inspection.getCompletedAt(),
                inspection.getCancelledAt(),
                inspection.getFailureReason(),
                hasRes,
                score
        );
    }
}
