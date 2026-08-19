package com.sih.inspection.inspection.dto;

import com.sih.inspection.inspection.entity.Inspection;
import com.sih.inspection.inspection.entity.InspectionResult;
import com.sih.inspection.inspection.enums.InspectionStatus;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Detailed response DTO for persisted ML inspection results, used by dashboards and report generators.
 */
public record InspectionResultResponse(
        UUID inspectionId,
        String inspectionNumber,
        InspectionStatus status,
        Double finalScore,
        Map<String, Object> garbageDetection,
        Map<String, Object> infrastructureCheckup,
        Map<String, Object> computerConnectivity,
        String modelVersion,
        Instant receivedAt,
        Instant completedAt,
        Map<String, Object> rawResponse
) {
    public static InspectionResultResponse from(InspectionResult result) {
        if (result == null) {
            return null;
        }

        Inspection inspection = result.getInspection();
        return new InspectionResultResponse(
                inspection != null ? inspection.getId() : null,
                inspection != null ? inspection.getInspectionNumber() : null,
                inspection != null ? inspection.getStatus() : null,
                result.getFinalScore(),
                result.getGarbageResult(),
                result.getInfrastructureResult(),
                result.getComputerResult(),
                result.getModelVersion(),
                result.getReceivedAt(),
                inspection != null ? inspection.getCompletedAt() : null,
                result.getRawResponse()
        );
    }
}
