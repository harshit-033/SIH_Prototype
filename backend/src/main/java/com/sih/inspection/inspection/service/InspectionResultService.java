package com.sih.inspection.inspection.service;

import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.exception.DuplicateResourceException;
import com.sih.inspection.exception.ResourceNotFoundException;
import com.sih.inspection.inspection.dto.InspectionResultResponse;
import com.sih.inspection.inspection.dto.InspectionSummaryResponse;
import com.sih.inspection.inspection.dto.MLInspectionResultRequest;
import com.sih.inspection.inspection.entity.Inspection;
import com.sih.inspection.inspection.entity.InspectionResult;
import com.sih.inspection.inspection.enums.InspectionStatus;
import com.sih.inspection.inspection.repository.InspectionRepository;
import com.sih.inspection.inspection.repository.InspectionResultRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Service managing ML result validation, atomic persistence, duplicate protection, and dashboard/report result retrieval.
 */
@Service
public class InspectionResultService {

    private static final Logger log = LoggerFactory.getLogger(InspectionResultService.class);

    private final InspectionRepository inspectionRepository;
    private final InspectionResultRepository resultRepository;
    private final InspectionAuditService auditService;

    public InspectionResultService(InspectionRepository inspectionRepository,
                                   InspectionResultRepository resultRepository,
                                   InspectionAuditService auditService) {
        this.inspectionRepository = inspectionRepository;
        this.resultRepository = resultRepository;
        this.auditService = auditService;
    }

    /**
     * Atomically validates and persists the combined ML inspection result and transitions the inspection to COMPLETED.
     * Guaranteed transactional atomicity: result persistence + status change + audit logging succeed or rollback together.
     */
    @Transactional
    public InspectionResultResponse processMLResult(UUID inspectionId,
                                                    MLInspectionResultRequest request,
                                                    Map<String, Object> rawPayload,
                                                    String authenticatedActor) {
        Inspection inspection = inspectionRepository.findByIdWithDetails(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inspection not found with ID: " + inspectionId));

        // State validation
        if (inspection.getStatus() == InspectionStatus.COMPLETED || resultRepository.existsByInspectionId(inspectionId)) {
            log.warn("Duplicate result submission rejected for inspection [{}] (number: [{}])", inspectionId, inspection.getInspectionNumber());
            throw new DuplicateResourceException("Inspection already has a finalized result. Duplicate result submissions are rejected.");
        }

        if (inspection.getStatus() == InspectionStatus.REQUESTED) {
            throw new IllegalArgumentException("Cannot submit ML result: Inspection is in REQUESTED status. It must be started first.");
        }

        if (inspection.getStatus() == InspectionStatus.CANCELLED || inspection.getStatus() == InspectionStatus.FAILED) {
            throw new IllegalArgumentException("Cannot submit ML result: Inspection is in terminal status: " + inspection.getStatus());
        }

        // Score validation
        Double score = request.finalScore();
        if (score == null || score < 0.0 || score > 100.0) {
            throw new IllegalArgumentException("Final score must be between 0.0 and 100.0. Provided: " + score);
        }

        // Preserve raw response
        Map<String, Object> finalRawResponse = rawPayload != null && !rawPayload.isEmpty()
                ? rawPayload
                : buildFallbackRawResponse(request);

        String modelVer = (request.modelVersion() != null && !request.modelVersion().isBlank())
                ? request.modelVersion()
                : "1.0.0";

        InspectionResult result = new InspectionResult(
                inspection,
                request.garbageDetection(),
                request.infrastructureCheckup(),
                request.computerConnectivity(),
                finalRawResponse,
                score,
                modelVer
        );

        InspectionResult savedResult = resultRepository.save(result);

        // Transition inspection to COMPLETED
        inspection.setResult(savedResult);
        inspection.complete();
        inspectionRepository.save(inspection);

        log.info("ML result processed successfully for inspection [{}]: number=[{}], finalScore=[{}], modelVersion=[{}], actor=[{}]",
                inspection.getId(), inspection.getInspectionNumber(), score, modelVer, authenticatedActor);

        auditService.recordEvent(
                inspection.getId(),
                "ML_RESULT_RECEIVED",
                authenticatedActor,
                Map.of(
                        "finalScore", score,
                        "modelVersion", modelVer,
                        "receivedAt", savedResult.getReceivedAt().toString()
                )
        );

        auditService.recordEvent(
                inspection.getId(),
                "INSPECTION_COMPLETED",
                authenticatedActor,
                Map.of("completedAt", inspection.getCompletedAt().toString())
        );

        return InspectionResultResponse.from(savedResult);
    }

    /**
     * Retrieves the persisted inspection result for an inspection.
     */
    @Transactional(readOnly = true)
    public InspectionResultResponse getResultByInspectionId(UUID inspectionId, String authenticatedEmail, Role userRole) {
        Inspection inspection = inspectionRepository.findByIdWithDetails(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inspection not found with ID: " + inspectionId));

        validateOwnership(inspection, authenticatedEmail, userRole);

        InspectionResult result = resultRepository.findByInspectionId(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inspection result not found for inspection ID: " + inspectionId));

        return InspectionResultResponse.from(result);
    }

    /**
     * Retrieves the dashboard summary for an inspection.
     */
    @Transactional(readOnly = true)
    public InspectionSummaryResponse getSummaryByInspectionId(UUID inspectionId, String authenticatedEmail, Role userRole) {
        Inspection inspection = inspectionRepository.findByIdWithDetails(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inspection not found with ID: " + inspectionId));

        validateOwnership(inspection, authenticatedEmail, userRole);

        return InspectionSummaryResponse.from(inspection);
    }

    private Map<String, Object> buildFallbackRawResponse(MLInspectionResultRequest request) {
        Map<String, Object> map = new HashMap<>();
        if (request.garbageDetection() != null) map.put("garbageDetection", request.garbageDetection());
        if (request.infrastructureCheckup() != null) map.put("infrastructureCheckup", request.infrastructureCheckup());
        if (request.computerConnectivity() != null) map.put("computerConnectivity", request.computerConnectivity());
        map.put("finalScore", request.finalScore());
        if (request.modelVersion() != null) map.put("modelVersion", request.modelVersion());
        return map;
    }

    private void validateOwnership(Inspection inspection, String authenticatedEmail, Role userRole) {
        if (userRole == Role.ADMIN || userRole == Role.INSPECTOR || userRole == Role.ML_SERVICE) {
            return;
        }

        if (userRole == Role.INSTITUTE) {
            String instituteEmail = inspection.getInstitute().getContactEmail();
            if (instituteEmail == null || !instituteEmail.equalsIgnoreCase(authenticatedEmail)) {
                throw new AccessDeniedException("Access denied: You cannot view results for an inspection belonging to another institute.");
            }
        }
    }
}
