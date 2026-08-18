package com.sih.inspection.institute.dto;

import com.sih.inspection.institute.entity.Institute;
import com.sih.inspection.institute.entity.InstituteStatus;

import java.time.Instant;

/**
 * Standard response DTO for Institute entity.
 */
public record InstituteResponse(
        Long id,
        String name,
        String code,
        String address,
        String region,
        String city,
        String state,
        String contactEmail,
        String contactPhone,
        InstituteStatus status,
        Instant createdAt,
        Instant updatedAt
) {
    public static InstituteResponse from(Institute institute) {
        if (institute == null) {
            return null;
        }
        return new InstituteResponse(
                institute.getId(),
                institute.getName(),
                institute.getCode(),
                institute.getAddress(),
                institute.getRegion(),
                institute.getCity(),
                institute.getState(),
                institute.getContactEmail(),
                institute.getContactPhone(),
                institute.getStatus(),
                institute.getCreatedAt(),
                institute.getUpdatedAt()
        );
    }
}
