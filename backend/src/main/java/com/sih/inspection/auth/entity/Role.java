package com.sih.inspection.auth.entity;

/**
 * Role-based access control roles for the Inspection Platform.
 * <p>
 * Supported roles:
 * <ul>
 *   <li>ADMIN — System administrator</li>
 *   <li>INSPECTOR — Expert Visit Committee member / inspector</li>
 *   <li>INSTITUTE — College / Institute representative</li>
 * </ul>
 * </p>
 */
public enum Role {
    ADMIN,
    INSPECTOR,
    INSTITUTE;

    public String getAuthority() {
        return "ROLE_" + name();
    }
}
