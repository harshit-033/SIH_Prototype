package com.sih.inspection.inspection.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.Objects;

/**
 * Domain entity representing the persisted evaluation result from the external ML Inspection service.
 * Stores individual model outputs and the complete untouched original response in PostgreSQL JSONB.
 */
@Entity
@Table(
        name = "inspection_results",
        indexes = {
                @Index(name = "idx_results_inspection_id", columnList = "inspection_id", unique = true),
                @Index(name = "idx_results_received_at", columnList = "received_at")
        }
)
public class InspectionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id", nullable = false, unique = true)
    private Inspection inspection;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "garbage_result", columnDefinition = "jsonb")
    private Map<String, Object> garbageResult;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "infrastructure_result", columnDefinition = "jsonb")
    private Map<String, Object> infrastructureResult;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "computer_result", columnDefinition = "jsonb")
    private Map<String, Object> computerResult;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_response", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> rawResponse;

    @Column(name = "final_score", nullable = false)
    private Double finalScore;

    @Column(name = "model_version", length = 100)
    private String modelVersion;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public InspectionResult() {
    }

    public InspectionResult(Inspection inspection,
                            Map<String, Object> garbageResult,
                            Map<String, Object> infrastructureResult,
                            Map<String, Object> computerResult,
                            Map<String, Object> rawResponse,
                            Double finalScore,
                            String modelVersion) {
        this.inspection = inspection;
        this.garbageResult = garbageResult;
        this.infrastructureResult = infrastructureResult;
        this.computerResult = computerResult;
        this.rawResponse = rawResponse;
        this.finalScore = finalScore;
        this.modelVersion = modelVersion;
        this.receivedAt = Instant.now();
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
        if (this.receivedAt == null) {
            this.receivedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Inspection getInspection() {
        return inspection;
    }

    public void setInspection(Inspection inspection) {
        this.inspection = inspection;
    }

    public Map<String, Object> getGarbageResult() {
        return garbageResult;
    }

    public void setGarbageResult(Map<String, Object> garbageResult) {
        this.garbageResult = garbageResult;
    }

    public Map<String, Object> getInfrastructureResult() {
        return infrastructureResult;
    }

    public void setInfrastructureResult(Map<String, Object> infrastructureResult) {
        this.infrastructureResult = infrastructureResult;
    }

    public Map<String, Object> getComputerResult() {
        return computerResult;
    }

    public void setComputerResult(Map<String, Object> computerResult) {
        this.computerResult = computerResult;
    }

    public Map<String, Object> getRawResponse() {
        return rawResponse;
    }

    public void setRawResponse(Map<String, Object> rawResponse) {
        this.rawResponse = rawResponse;
    }

    public Double getFinalScore() {
        return finalScore;
    }

    public void setFinalScore(Double finalScore) {
        this.finalScore = finalScore;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }

    public Instant getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(Instant receivedAt) {
        this.receivedAt = receivedAt;
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
        InspectionResult that = (InspectionResult) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
