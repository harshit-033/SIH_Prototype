package com.sih.inspection.inspection.controller;

import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.common.ApiResponse;
import com.sih.inspection.inspection.dto.CreateInspectionRequest;
import com.sih.inspection.inspection.dto.InspectionResponse;
import com.sih.inspection.inspection.dto.InspectionResultResponse;
import com.sih.inspection.inspection.dto.InspectionSummaryResponse;
import com.sih.inspection.inspection.dto.MLInspectionResultRequest;
import com.sih.inspection.inspection.enums.InspectionStatus;
import com.sih.inspection.inspection.enums.InspectionType;
import com.sih.inspection.inspection.service.InspectionResultService;
import com.sih.inspection.inspection.service.InspectionService;
import com.sih.inspection.security.SecurityUser;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

/**
 * REST controller for managing Inspections and receiving external ML evaluation results.
 * Base path: /api/v1/inspections
 */
@RestController
@RequestMapping("/api/v1/inspections")
public class InspectionController {

    private final InspectionService inspectionService;
    private final InspectionResultService resultService;

    public InspectionController(InspectionService inspectionService, InspectionResultService resultService) {
        this.inspectionService = inspectionService;
        this.resultService = resultService;
    }

    /**
     * Creates / requests a new inspection.
     * Accessible by INSTITUTE and ADMIN roles.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('INSTITUTE', 'ADMIN')")
    public ResponseEntity<ApiResponse<InspectionResponse>> createInspection(
            @Valid @RequestBody CreateInspectionRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        Role role = extractRole(authentication);

        InspectionResponse response = inspectionService.createInspection(request, email, role);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Inspection requested successfully", response));
    }

    /**
     * Lists inspections with pagination and optional filtering by status and type.
     * Enforces institute data isolation for INSTITUTE role.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSPECTOR', 'INSTITUTE')")
    public ResponseEntity<ApiResponse<Page<InspectionResponse>>> listInspections(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) InspectionStatus status,
            @RequestParam(required = false) InspectionType type,
            Authentication authentication) {

        String email = authentication.getName();
        Role role = extractRole(authentication);

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "requestedAt"));
        Page<InspectionResponse> response = inspectionService.listInspections(pageRequest, status, type, email, role);

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * Retrieves detailed information for a specific inspection.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSPECTOR', 'INSTITUTE')")
    public ResponseEntity<ApiResponse<InspectionResponse>> getInspectionById(
            @PathVariable UUID id,
            Authentication authentication) {

        String email = authentication.getName();
        Role role = extractRole(authentication);

        InspectionResponse response = inspectionService.getInspectionById(id, email, role);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * Starts an inspection (transitions from REQUESTED to PROCESSING).
     */
    @PostMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSPECTOR', 'INSTITUTE')")
    public ResponseEntity<ApiResponse<InspectionResponse>> startInspection(
            @PathVariable UUID id,
            Authentication authentication) {

        String email = authentication.getName();
        Role role = extractRole(authentication);

        InspectionResponse response = inspectionService.startInspection(id, email, role);
        return ResponseEntity.ok(ApiResponse.ok("Inspection started successfully", response));
    }

    /**
     * Cancels an inspection in REQUESTED status.
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE')")
    public ResponseEntity<ApiResponse<InspectionResponse>> cancelInspection(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {

        String email = authentication.getName();
        Role role = extractRole(authentication);
        String reason = (body != null) ? body.get("reason") : null;

        InspectionResponse response = inspectionService.cancelInspection(id, reason, email, role);
        return ResponseEntity.ok(ApiResponse.ok("Inspection cancelled successfully", response));
    }

    /**
     * ML RESULT SUBMISSION ENDPOINT.
     * Receives the combined evaluation JSON response from the external ML service.
     * Accessible by dedicated ML_SERVICE machine role and ADMIN.
     */
    @PostMapping("/{id}/results")
    @PreAuthorize("hasAnyRole('ML_SERVICE', 'ADMIN')")
    public ResponseEntity<ApiResponse<InspectionResultResponse>> submitMLResult(
            @PathVariable UUID id,
            @Valid @RequestBody MLInspectionResultRequest request,
            Authentication authentication) {

        String actor = authentication.getName();
        InspectionResultResponse response = resultService.processMLResult(id, request, null, actor);

        return ResponseEntity.ok(ApiResponse.ok("Inspection result processed and recorded successfully", response));
    }

    /**
     * Retrieves the persisted ML inspection result.
     */
    @GetMapping("/{id}/results")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSPECTOR', 'INSTITUTE')")
    public ResponseEntity<ApiResponse<InspectionResultResponse>> getInspectionResult(
            @PathVariable UUID id,
            Authentication authentication) {

        String email = authentication.getName();
        Role role = extractRole(authentication);

        InspectionResultResponse response = resultService.getResultByInspectionId(id, email, role);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * Retrieves dashboard summary information for an inspection.
     */
    @GetMapping("/{id}/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSPECTOR', 'INSTITUTE')")
    public ResponseEntity<ApiResponse<InspectionSummaryResponse>> getInspectionSummary(
            @PathVariable UUID id,
            Authentication authentication) {

        String email = authentication.getName();
        Role role = extractRole(authentication);

        InspectionSummaryResponse response = resultService.getSummaryByInspectionId(id, email, role);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    private Role extractRole(Authentication authentication) {
        if (authentication.getPrincipal() instanceof SecurityUser securityUser) {
            return securityUser.getRole();
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> Role.valueOf(a.substring(5)))
                .findFirst()
                .orElse(Role.INSTITUTE);
    }
}
