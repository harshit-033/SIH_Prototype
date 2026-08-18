package com.sih.inspection.auth.entity;

/**
 * Account lifecycle status for users.
 */
public enum AccountStatus {
    ACTIVE,
    DISABLED,
    SUSPENDED,
    PENDING_VERIFICATION;

    public boolean canLogin() {
        return this == ACTIVE;
    }
}
