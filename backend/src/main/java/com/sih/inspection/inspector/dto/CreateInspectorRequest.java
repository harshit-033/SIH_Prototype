package com.sih.inspection.inspector.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request payload for creating/provisioning a new Inspector user account.
 * <p>
 * Does not accept role or account status fields from the client to prevent privilege escalation.
 * The backend service unconditionally assigns {@code Role.INSPECTOR} and {@code AccountStatus.ACTIVE}.
 * </p>
 *
 * @param email    Inspector's email address
 * @param password Inspector's initial raw password
 */
public record CreateInspectorRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email address")
        @Size(max = 255, message = "Email cannot exceed 255 characters")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
        String password
) {}
