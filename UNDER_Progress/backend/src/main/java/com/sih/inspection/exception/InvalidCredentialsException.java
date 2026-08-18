package com.sih.inspection.exception;

import org.springframework.security.core.AuthenticationException;

/**
 * Exception thrown when authentication fails due to invalid credentials.
 */
public class InvalidCredentialsException extends AuthenticationException {

    public InvalidCredentialsException() {
        super("Invalid email or password");
    }

    public InvalidCredentialsException(String msg) {
        super(msg);
    }
}
