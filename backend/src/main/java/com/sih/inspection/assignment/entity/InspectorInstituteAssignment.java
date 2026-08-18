package com.sih.inspection.assignment.entity;

import com.sih.inspection.auth.entity.User;
import com.sih.inspection.institute.entity.Institute;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.Objects;

/**
 * Domain entity representing an assignment of an Inspector to an Institute.
 * <p>
 * Business Rule:
 * <ul>
 *   <li>One Inspector can be assigned to multiple Institutes (1 : N)</li>
 *   <li>One Institute can have at most ONE active Inspector assigned at any given time (N : 1)</li>
 * </ul>
 * </p>
 */
@Entity
@Table(
        name = "inspector_institute_assignments",
        indexes = {
                @Index(name = "idx_assignment_inspector", columnList = "inspector_id"),
                @Index(name = "idx_assignment_institute", columnList = "institute_id"),
                @Index(name = "idx_assignment_inspector_status", columnList = "inspector_id, status"),
                @Index(name = "idx_assignment_institute_status", columnList = "institute_id, status")
        }
)
public class InspectorInstituteAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspector_id", nullable = false)
    private User inspector;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institute_id", nullable = false)
    private Institute institute;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private AssignmentStatus status = AssignmentStatus.ACTIVE;

    @Column(name = "assigned_at", nullable = false)
    private Instant assignedAt;

    @Column(name = "deactivated_at")
    private Instant deactivatedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public InspectorInstituteAssignment() {
    }

    public InspectorInstituteAssignment(User inspector, Institute institute) {
        this.inspector = inspector;
        this.institute = institute;
        this.status = AssignmentStatus.ACTIVE;
        this.assignedAt = Instant.now();
    }

    public InspectorInstituteAssignment(Long id, User inspector, Institute institute,
                                        AssignmentStatus status, Instant assignedAt,
                                        Instant deactivatedAt, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.inspector = inspector;
        this.institute = institute;
        this.status = status != null ? status : AssignmentStatus.ACTIVE;
        this.assignedAt = assignedAt != null ? assignedAt : Instant.now();
        this.deactivatedAt = deactivatedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.updatedAt == null) {
            this.updatedAt = now;
        }
        if (this.assignedAt == null) {
            this.assignedAt = now;
        }
        if (this.status == null) {
            this.status = AssignmentStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void deactivate() {
        this.status = AssignmentStatus.INACTIVE;
        this.deactivatedAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getInspector() {
        return inspector;
    }

    public void setInspector(User inspector) {
        this.inspector = inspector;
    }

    public Institute getInstitute() {
        return institute;
    }

    public void setInstitute(Institute institute) {
        this.institute = institute;
    }

    public AssignmentStatus getStatus() {
        return status;
    }

    public void setStatus(AssignmentStatus status) {
        this.status = status;
    }

    public Instant getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(Instant assignedAt) {
        this.assignedAt = assignedAt;
    }

    public Instant getDeactivatedAt() {
        return deactivatedAt;
    }

    public void setDeactivatedAt(Instant deactivatedAt) {
        this.deactivatedAt = deactivatedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        InspectorInstituteAssignment that = (InspectorInstituteAssignment) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
