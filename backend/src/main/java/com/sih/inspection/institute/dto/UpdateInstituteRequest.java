package com.sih.inspection.institute.dto;

import com.sih.inspection.institute.entity.InstituteStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for updating an existing Institute.
 */
public record UpdateInstituteRequest(
        @NotBlank(message = "Institute name is required")
        @Size(max = 200, message = "Institute name cannot exceed 200 characters")
        String name,

        @NotBlank(message = "Institute code is required")
        @Size(max = 50, message = "Institute code cannot exceed 50 characters")
        @Pattern(regexp = "^[A-Za-z0-9_-]+$", message = "Institute code must contain only alphanumeric characters, hyphens, or underscores")
        String code,

        @NotBlank(message = "Address is required")
        @Size(max = 500, message = "Address cannot exceed 500 characters")
        String address,

        @NotBlank(message = "Region is required")
        @Size(max = 100, message = "Region cannot exceed 100 characters")
        String region,

        @NotBlank(message = "City is required")
        @Size(max = 100, message = "City cannot exceed 100 characters")
        String city,

        @NotBlank(message = "State is required")
        @Size(max = 100, message = "State cannot exceed 100 characters")
        String state,

        @NotBlank(message = "Contact email is required")
        @Email(message = "Contact email must be a valid email address")
        @Size(max = 150, message = "Contact email cannot exceed 150 characters")
        String contactEmail,

        @NotBlank(message = "Contact phone is required")
        @Pattern(
                regexp = "^(?:\\+91|0)?[6-9]\\d{9}$",
                message = "Contact phone must be a valid 10-digit Indian phone number"
        )
        String contactPhone,

        @NotNull(message = "Institute status is required")
        InstituteStatus status
) {}
