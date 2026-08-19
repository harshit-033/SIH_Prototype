package com.sih.inspection.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;

/**
 * Structured error response payload returned by {@link GlobalExceptionHandler}.
 * <p>
 * All REST error responses use this shape so clients have a predictable contract.
 * The {@code errors} field is only present for validation failures.
 * </p>
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        int status,
        String error,
        String message,
        String path,
        Instant timestamp,
        List<FieldViolation> errors
) {
    /**
     * Field-level validation violation detail.
     */
    public record FieldViolation(String field, String message) {}

    /**
     * Factory for simple errors without field violations.
     */
    public static ApiError of(int status, String error, String message, String path) {
        return new ApiError(status, error, message, path, Instant.now(), null);
    }

    /**
     * Factory for validation errors with field violations.
     */
    public static ApiError of(int status, String error, String message, String path,
                               List<FieldViolation> violations) {
        return new ApiError(status, error, message, path, Instant.now(), violations);
    }
}
