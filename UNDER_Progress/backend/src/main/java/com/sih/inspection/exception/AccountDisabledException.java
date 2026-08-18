package com.sih.inspection.exception;

import org.springframework.security.core.AuthenticationException;

/**
 * Exception thrown when an inactive, suspended, or disabled user attempts to authenticate.
 */
public class AccountDisabledException extends AuthenticationException {

    public AccountDisabledException() {
        super("Account is disabled. Please contact an administrator.");
    }

    public AccountDisabledException(String msg) {
        super(msg);
    }
}
