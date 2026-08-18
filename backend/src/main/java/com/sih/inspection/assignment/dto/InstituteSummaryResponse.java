package com.sih.inspection.assignment.dto;

import com.sih.inspection.institute.entity.Institute;
import com.sih.inspection.institute.entity.InstituteStatus;

/**
 * Summary DTO representing an assigned institute.
 */
public record InstituteSummaryResponse(
        Long id,
        String name,
        String code,
        String city,
        String state,
        InstituteStatus status
) {
    public static InstituteSummaryResponse from(Institute institute) {
        if (institute == null) {
            return null;
        }
        return new InstituteSummaryResponse(
                institute.getId(),
                institute.getName(),
                institute.getCode(),
                institute.getCity(),
                institute.getState(),
                institute.getStatus()
        );
    }
}
