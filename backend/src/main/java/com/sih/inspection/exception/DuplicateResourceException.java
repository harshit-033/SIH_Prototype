package com.sih.inspection.exception;

/**
 * Thrown when an entity creation or update conflicts with an existing unique constraint (e.g. duplicate code or email).
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
