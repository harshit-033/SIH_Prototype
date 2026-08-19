package com.sih.inspection.inspector.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.sih.inspection.auth.entity.AccountStatus;
import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.auth.entity.User;

import java.time.Instant;

/**
 * Safe response DTO representing an Inspector user account.
 * <p>
 * Excludes sensitive credentials such as password hashes, JWT tokens, and internal security secrets.
 * </p>
 *
 * @param id        User identifier
 * @param email     Inspector's email address
 * @param role      Assigned role (always INSPECTOR)
 * @param status    Account lifecycle status (e.g. ACTIVE)
 * @param createdAt Account creation timestamp
 * @param updatedAt Account last update timestamp
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record InspectorResponse(
        Long id,
        String email,
        Role role,
        AccountStatus status,
        Instant createdAt,
        Instant updatedAt
) {
    /**
     * Factory method to safely transform a {@link User} entity into an {@link InspectorResponse}.
     *
     * @param user the source user entity
     * @return InspectorResponse or null if user is null
     */
    public static InspectorResponse from(User user) {
        if (user == null) {
            return null;
        }
        return new InspectorResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
