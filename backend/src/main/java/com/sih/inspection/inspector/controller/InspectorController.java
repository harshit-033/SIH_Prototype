package com.sih.inspection.inspector.controller;

import com.sih.inspection.common.ApiResponse;
import com.sih.inspection.inspector.dto.CreateInspectorRequest;
import com.sih.inspection.inspector.dto.InspectorResponse;
import com.sih.inspection.inspector.service.InspectorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for administrator provisioning and management of Inspector accounts.
 * <p>
 * Enforces role-based access control:
 * <ul>
 *   <li>Create Inspector: Admin only (ROLE_ADMIN)</li>
 *   <li>List Inspectors: Admin only (ROLE_ADMIN)</li>
 *   <li>Get Inspector by ID: Admin only (ROLE_ADMIN)</li>
 * </ul>
 * Newly created accounts are always provisioned with {@code Role.INSPECTOR} and {@code AccountStatus.ACTIVE}.
 * </p>
 */
@RestController
@RequestMapping("/api/v1/inspectors")
public class InspectorController {

    private final InspectorService inspectorService;

    public InspectorController(InspectorService inspectorService) {
        this.inspectorService = inspectorService;
    }

    /**
     * Provisions a new Inspector user account.
     * <p>Accessible only by System Administrators (ROLE_ADMIN).</p>
     *
     * @param request validated inspector creation payload
     * @return ApiResponse containing the created inspector details with HTTP 201 Created
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InspectorResponse>> createInspector(
            @Valid @RequestBody CreateInspectorRequest request) {
        InspectorResponse response = inspectorService.createInspector(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Inspector created successfully", response));
    }

    /**
     * Retrieves all registered Inspector user accounts.
     * <p>Accessible only by System Administrators (ROLE_ADMIN).</p>
     *
     * @return ApiResponse containing list of inspector accounts with HTTP 200 OK
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<InspectorResponse>>> getAllInspectors() {
        List<InspectorResponse> inspectors = inspectorService.getAllInspectors();
        return ResponseEntity.ok(ApiResponse.ok("Inspectors retrieved successfully", inspectors));
    }

    /**
     * Retrieves a single Inspector account by user ID.
     * <p>Accessible only by System Administrators (ROLE_ADMIN).</p>
     *
     * @param id inspector user ID
     * @return ApiResponse containing inspector details with HTTP 200 OK
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InspectorResponse>> getInspectorById(@PathVariable Long id) {
        InspectorResponse response = inspectorService.getInspectorById(id);
        return ResponseEntity.ok(ApiResponse.ok("Inspector retrieved successfully", response));
    }
}
