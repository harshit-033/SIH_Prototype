package com.sih.inspection.exception;

/**
 * Thrown when a requested resource (e.g. Institute) cannot be found in the database.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
