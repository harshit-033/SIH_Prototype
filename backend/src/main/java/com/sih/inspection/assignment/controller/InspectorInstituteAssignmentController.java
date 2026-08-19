package com.sih.inspection.assignment.controller;

import com.sih.inspection.assignment.dto.AssignmentResponse;
import com.sih.inspection.assignment.dto.AssignmentSummaryResponse;
import com.sih.inspection.assignment.dto.CreateAssignmentRequest;
import com.sih.inspection.assignment.dto.InspectorSummaryResponse;
import com.sih.inspection.assignment.entity.AssignmentStatus;
import com.sih.inspection.assignment.service.InspectorInstituteAssignmentService;
import com.sih.inspection.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for managing Inspector ↔ Institute assignments.
 * <p>
 * Enforces role-based access control:
 * <ul>
 *   <li>ADMIN: Create, list, retrieve, and deactivate assignments</li>
 *   <li>INSPECTOR: View their own assigned institutes via /my</li>
 *   <li>INSTITUTE: Forbidden from global assignment management</li>
 * </ul>
 * </p>
 */
@RestController
@RequestMapping
public class InspectorInstituteAssignmentController {

    private final InspectorInstituteAssignmentService assignmentService;

    public InspectorInstituteAssignmentController(InspectorInstituteAssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    /**
     * Creates an assignment between an inspector and an institute.
     * <p>Accessible only by System Administrators (ROLE_ADMIN).</p>
     *
     * @param request validated creation payload
     * @return ApiResponse containing the assignment details with HTTP 201 Created
     */
    @PostMapping("/api/inspector-assignments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> createAssignment(
            @Valid @RequestBody CreateAssignmentRequest request) {
        AssignmentResponse response = assignmentService.createAssignment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Inspector assigned to institute successfully", response));
    }

    /**
     * Lists all assignments with optional status filtering.
     * <p>Accessible only by System Administrators (ROLE_ADMIN).</p>
     *
     * @param status optional status filter (ACTIVE / INACTIVE)
     * @return ApiResponse containing summary list of assignments
     */
    @GetMapping("/api/inspector-assignments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AssignmentSummaryResponse>>> getAllAssignments(
            @RequestParam(required = false) AssignmentStatus status) {
        List<AssignmentSummaryResponse> list = assignmentService.getAllAssignments(status);
        return ResponseEntity.ok(ApiResponse.ok("Assignments retrieved successfully", list));
    }

    /**
     * Retrieves a specific assignment by ID.
     * <p>Accessible only by System Administrators (ROLE_ADMIN).</p>
     *
     * @param id assignment ID
     * @return ApiResponse containing detailed assignment
     */
    @GetMapping("/api/inspector-assignments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignmentById(@PathVariable Long id) {
        AssignmentResponse response = assignmentService.getAssignmentById(id);
        return ResponseEntity.ok(ApiResponse.ok("Assignment retrieved successfully", response));
    }

    /**
     * Soft-deactivates an assignment (sets status to INACTIVE).
     * <p>Accessible only by System Administrators (ROLE_ADMIN).</p>
     *
     * @param id assignment ID to deactivate
     * @return ApiResponse containing deactivated assignment
     */
    @DeleteMapping("/api/inspector-assignments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> deactivateAssignment(@PathVariable Long id) {
        AssignmentResponse response = assignmentService.deactivateAssignment(id);
        return ResponseEntity.ok(ApiResponse.ok("Assignment deactivated successfully", response));
    }

    /**
     * Retrieves active assigned institutes for the currently authenticated inspector.
     * <p>Accessible only by Inspectors (ROLE_INSPECTOR). Uses SecurityContext to prevent identity spoofing.</p>
     *
     * @param authentication current Spring Security authentication
     * @return ApiResponse containing list of assigned institutes
     */
    @GetMapping("/api/inspector-assignments/my")
    @PreAuthorize("hasRole('INSPECTOR')")
    public ResponseEntity<ApiResponse<List<AssignmentSummaryResponse>>> getMyAssignments(
            Authentication authentication) {
        String inspectorEmail = authentication.getName();
        List<AssignmentSummaryResponse> list = assignmentService.getMyAssignments(inspectorEmail);
        return ResponseEntity.ok(ApiResponse.ok("Assigned institutes retrieved successfully", list));
    }

    /**
     * Retrieves the active inspector assigned to a specific institute.
     * <p>Accessible by Administrators and Inspectors (ROLE_ADMIN, ROLE_INSPECTOR).</p>
     *
     * @param instituteId institute ID
     * @return ApiResponse containing assigned inspector info
     */
    @GetMapping("/api/institutes/{instituteId}/inspector")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSPECTOR')")
    public ResponseEntity<ApiResponse<InspectorSummaryResponse>> getInspectorForInstitute(
            @PathVariable Long instituteId) {
        InspectorSummaryResponse response = assignmentService.getInspectorForInstitute(instituteId);
        return ResponseEntity.ok(ApiResponse.ok("Institute inspector retrieved successfully", response));
    }
}
