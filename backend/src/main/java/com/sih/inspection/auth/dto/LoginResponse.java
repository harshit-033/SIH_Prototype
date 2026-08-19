package com.sih.inspection.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.sih.inspection.auth.entity.AccountStatus;
import com.sih.inspection.auth.entity.Role;

/**
 * Authentication response payload containing the JWT and essential user profile metadata.
 * Passwords and sensitive internal data are strictly omitted.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record LoginResponse(
        String token,
        String tokenType,
        long expiresIn,
        Long userId,
        String email,
        Role role,
        AccountStatus status
) {
    public static LoginResponse of(String token, long expiresIn, Long userId, String email, Role role, AccountStatus status) {
        return new LoginResponse(token, "Bearer", expiresIn, userId, email, role, status);
    }
}
