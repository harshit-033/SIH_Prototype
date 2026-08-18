package com.sih.inspection.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.sih.inspection.auth.entity.AccountStatus;
import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.auth.entity.User;

import java.time.Instant;

/**
 * Summary DTO representing currently authenticated user.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record UserSummaryResponse(
        Long id,
        String email,
        Role role,
        AccountStatus status,
        Instant createdAt,
        Instant updatedAt
) {
    public static UserSummaryResponse from(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
