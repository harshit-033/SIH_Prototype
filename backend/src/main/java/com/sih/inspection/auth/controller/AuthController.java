package com.sih.inspection.auth.controller;

import com.sih.inspection.auth.dto.LoginRequest;
import com.sih.inspection.auth.dto.LoginResponse;
import com.sih.inspection.auth.dto.UserSummaryResponse;
import com.sih.inspection.auth.service.AuthService;
import com.sih.inspection.common.ApiResponse;
import com.sih.inspection.security.SecurityUser;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for authentication operations.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Authenticates user credentials and returns a JWT access token.
     *
     * @param request login credentials (email, password)
     * @return ApiResponse containing JWT token and basic user metadata
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    /**
     * Seeds default demo accounts for testing and verification.
     *
     * @return ApiResponse containing list of demo users
     */
    @PostMapping("/seed")
    public ResponseEntity<ApiResponse<List<UserSummaryResponse>>> seedUsers() {
        List<UserSummaryResponse> users = authService.seedDefaultUsers();
        return ResponseEntity.ok(ApiResponse.ok("Demo users seeded successfully", users));
    }

    /**
     * Returns profile metadata for the currently authenticated user.
     *
     * @param currentUser currently authenticated principal
     * @return ApiResponse containing user details
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> getCurrentUser(
            @AuthenticationPrincipal SecurityUser currentUser) {
        UserSummaryResponse response = authService.getCurrentUserSummary(currentUser);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
