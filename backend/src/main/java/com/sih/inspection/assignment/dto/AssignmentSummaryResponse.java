package com.sih.inspection.assignment.dto;

import com.sih.inspection.assignment.entity.AssignmentStatus;
import com.sih.inspection.assignment.entity.InspectorInstituteAssignment;

import java.time.Instant;

/**
 * Lightweight summary response DTO for listing assignments efficiently.
 */
public record AssignmentSummaryResponse(
        Long id,
        Long inspectorId,
        String inspectorEmail,
        Long instituteId,
        String instituteName,
        String instituteCode,
        AssignmentStatus status,
        Instant assignedAt,
        Instant deactivatedAt
) {
    public static AssignmentSummaryResponse from(InspectorInstituteAssignment assignment) {
        if (assignment == null) {
            return null;
        }
        return new AssignmentSummaryResponse(
                assignment.getId(),
                assignment.getInspector() != null ? assignment.getInspector().getId() : null,
                assignment.getInspector() != null ? assignment.getInspector().getEmail() : null,
                assignment.getInstitute() != null ? assignment.getInstitute().getId() : null,
                assignment.getInstitute() != null ? assignment.getInstitute().getName() : null,
                assignment.getInstitute() != null ? assignment.getInstitute().getCode() : null,
                assignment.getStatus(),
                assignment.getAssignedAt(),
                assignment.getDeactivatedAt()
        );
    }
}
