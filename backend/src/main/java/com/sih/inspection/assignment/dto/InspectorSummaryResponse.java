package com.sih.inspection.assignment.dto;

import com.sih.inspection.auth.entity.AccountStatus;
import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.auth.entity.User;

/**
 * Summary DTO representing an assigned inspector.
 */
public record InspectorSummaryResponse(
        Long id,
        String email,
        Role role,
        AccountStatus status
) {
    public static InspectorSummaryResponse from(User user) {
        if (user == null) {
            return null;
        }
        return new InspectorSummaryResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getStatus()
        );
    }
}
