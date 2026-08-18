package com.sih.inspection.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

/**
 * Generic API response wrapper used by all REST controllers.
 * <p>
 * Keeps controller responses consistent and avoids leaking entity internals.
 * Future enhancement: add pagination metadata for list responses.
 * </p>
 *
 * @param <T> the type of the response payload
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        Instant timestamp
) {
    /**
     * Factory method for successful responses with data.
     */
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, null, data, Instant.now());
    }

    /**
     * Factory method for successful responses with data and a message.
     */
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data, Instant.now());
    }

    /**
     * Factory method for successful responses with only a message (no data).
     */
    public static <T> ApiResponse<T> ok(String message) {
        return new ApiResponse<>(true, message, null, Instant.now());
    }
}
