package com.sih.inspection.assignment.dto;

import com.sih.inspection.assignment.entity.AssignmentStatus;
import com.sih.inspection.assignment.entity.InspectorInstituteAssignment;

import java.time.Instant;

/**
 * Detailed response DTO for an Inspector-Institute assignment.
 */
public record AssignmentResponse(
        Long id,
        InspectorSummaryResponse inspector,
        InstituteSummaryResponse institute,
        AssignmentStatus status,
        Instant assignedAt,
        Instant deactivatedAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static AssignmentResponse from(InspectorInstituteAssignment assignment) {
        if (assignment == null) {
            return null;
        }
        return new AssignmentResponse(
                assignment.getId(),
                InspectorSummaryResponse.from(assignment.getInspector()),
                InstituteSummaryResponse.from(assignment.getInstitute()),
                assignment.getStatus(),
                assignment.getAssignedAt(),
                assignment.getDeactivatedAt(),
                assignment.getCreatedAt(),
                assignment.getUpdatedAt()
        );
    }
}
