package com.sih.inspection.inspection.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

/**
 * Combined JSON payload contract received from the external ML Inspection application.
 * Contains individual outputs from the 3 inspection models and the overall ML-computed score.
 */
public record MLInspectionResultRequest(
        Map<String, Object> garbageDetection,
        Map<String, Object> infrastructureCheckup,
        Map<String, Object> computerConnectivity,

        @NotNull(message = "Final score is required")
        @DecimalMin(value = "0.0", message = "Final score must be >= 0.0")
        @DecimalMax(value = "100.0", message = "Final score must be <= 100.0")
        Double finalScore,

        String modelVersion
) {
}
