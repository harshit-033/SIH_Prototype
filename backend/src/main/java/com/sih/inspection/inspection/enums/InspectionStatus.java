package com.sih.inspection.inspection.enums;

/**
 * Controlled lifecycle states for an Inspection.
 * <p>
 * State transitions:
 * <ul>
 *   <li>REQUESTED → PROCESSING (Started)</li>
 *   <li>REQUESTED → CANCELLED (Cancelled)</li>
 *   <li>PROCESSING → COMPLETED (ML result persisted)</li>
 *   <li>PROCESSING → FAILED (Processing failure)</li>
 * </ul>
 * </p>
 */
public enum InspectionStatus {
    REQUESTED,
    PROCESSING,
    COMPLETED,
    FAILED,
    CANCELLED
}
