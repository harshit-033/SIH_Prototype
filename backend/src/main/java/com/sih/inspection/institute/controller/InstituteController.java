package com.sih.inspection.institute.controller;

import com.sih.inspection.common.ApiResponse;
import com.sih.inspection.institute.dto.CreateInstituteRequest;
import com.sih.inspection.institute.dto.InstituteResponse;
import com.sih.inspection.institute.dto.UpdateInstituteRequest;
import com.sih.inspection.institute.service.InstituteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for managing Institute domain master data.
 * <p>
 * Enforces role-based access control:
 * <ul>
 *   <li>Create / Update: Admin only (ROLE_ADMIN)</li>
 *   <li>Read (List / Get by ID): Admin & Inspector (ROLE_ADMIN, ROLE_INSPECTOR)</li>
 * </ul>
 * </p>
 */
@RestController
@RequestMapping("/api/institutes")
public class InstituteController {

    private final InstituteService instituteService;

    public InstituteController(InstituteService instituteService) {
        this.instituteService = instituteService;
    }

    /**
     * Creates a new Institute record.
     * <p>Accessible only by System Administrators (ROLE_ADMIN).</p>
     *
     * @param request validated creation payload
     * @return ApiResponse containing the created institute with HTTP 201 Created
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InstituteResponse>> createInstitute(
            @Valid @RequestBody CreateInstituteRequest request) {
        InstituteResponse response = instituteService.createInstitute(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Institute created successfully", response));
    }

    /**
     * Retrieves all registered institutes.
     * <p>Accessible by Administrators and Inspectors (ROLE_ADMIN, ROLE_INSPECTOR).</p>
     *
     * @return ApiResponse containing list of institutes with HTTP 200 OK
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSPECTOR')")
    public ResponseEntity<ApiResponse<List<InstituteResponse>>> getAllInstitutes() {
        List<InstituteResponse> institutes = instituteService.getAllInstitutes();
        return ResponseEntity.ok(ApiResponse.ok("Institutes retrieved successfully", institutes));
    }

    /**
     * Retrieves a single institute by its ID.
     * <p>Accessible by Administrators and Inspectors (ROLE_ADMIN, ROLE_INSPECTOR).</p>
     *
     * @param id institute ID
     * @return ApiResponse containing institute details with HTTP 200 OK
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSPECTOR')")
    public ResponseEntity<ApiResponse<InstituteResponse>> getInstituteById(@PathVariable Long id) {
        InstituteResponse response = instituteService.getInstituteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Institute retrieved successfully", response));
    }

    /**
     * Updates an existing Institute record.
     * <p>Accessible only by System Administrators (ROLE_ADMIN).</p>
     *
     * @param id      institute ID
     * @param request validated update payload
     * @return ApiResponse containing the updated institute with HTTP 200 OK
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InstituteResponse>> updateInstitute(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInstituteRequest request) {
        InstituteResponse response = instituteService.updateInstitute(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Institute updated successfully", response));
    }
}
