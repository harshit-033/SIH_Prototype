package com.sih.inspection.inspection.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Domain entity recording structured audit trails for inspection lifecycle state transitions and ML integration events.
 */
@Entity
@Table(
        name = "inspection_audit_events",
        indexes = {
                @Index(name = "idx_audit_inspection_id", columnList = "inspection_id"),
                @Index(name = "idx_audit_timestamp", columnList = "timestamp")
        }
)
public class InspectionAuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inspection_id", nullable = false)
    private UUID inspectionId;

    @Column(name = "action", nullable = false, length = 100)
    private String action;

    @Column(name = "actor", nullable = false, length = 150)
    private String actor;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "details", columnDefinition = "jsonb")
    private Map<String, Object> details;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private Instant timestamp;

    public InspectionAuditEvent() {
    }

    public InspectionAuditEvent(UUID inspectionId, String action, String actor, Map<String, Object> details) {
        this.inspectionId = inspectionId;
        this.action = action;
        this.actor = actor;
        this.details = details;
        this.timestamp = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = Instant.now();
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UUID getInspectionId() {
        return inspectionId;
    }

    public void setInspectionId(UUID inspectionId) {
        this.inspectionId = inspectionId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getActor() {
        return actor;
    }

    public void setActor(String actor) {
        this.actor = actor;
    }

    public Map<String, Object> getDetails() {
        return details;
    }

    public void setDetails(Map<String, Object> details) {
        this.details = details;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
