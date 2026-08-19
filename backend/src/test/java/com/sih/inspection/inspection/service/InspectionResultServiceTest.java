package com.sih.inspection.inspection.service;

import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.exception.DuplicateResourceException;
import com.sih.inspection.exception.ResourceNotFoundException;
import com.sih.inspection.inspection.dto.InspectionResultResponse;
import com.sih.inspection.inspection.dto.MLInspectionResultRequest;
import com.sih.inspection.inspection.entity.Inspection;
import com.sih.inspection.inspection.entity.InspectionResult;
import com.sih.inspection.inspection.enums.InspectionStatus;
import com.sih.inspection.inspection.enums.InspectionType;
import com.sih.inspection.inspection.repository.InspectionRepository;
import com.sih.inspection.inspection.repository.InspectionResultRepository;
import com.sih.inspection.institute.entity.Institute;
import com.sih.inspection.institute.entity.InstituteStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InspectionResultServiceTest {

    @Mock
    private InspectionRepository inspectionRepository;

    @Mock
    private InspectionResultRepository resultRepository;

    @Mock
    private InspectionAuditService auditService;

    @InjectMocks
    private InspectionResultService resultService;

    private Institute sampleInstitute;
    private Inspection sampleInspection;
    private UUID sampleInspectionId;

    @BeforeEach
    void setup() {
        sampleInstitute = new Institute("Mumbai Institute of Technology", "MIT001", "Worli", "West", "Mumbai", "Maharashtra", "institute@sih.gov.in", "9876543210", InstituteStatus.ACTIVE);
        sampleInstitute.setId(20L);

        sampleInspectionId = UUID.randomUUID();
        sampleInspection = new Inspection("INS-2026-000005", sampleInstitute, InspectionType.FULL_INSPECTION);
        sampleInspection.setId(sampleInspectionId);
        sampleInspection.setStatus(InspectionStatus.PROCESSING);
    }

    @Test
    @DisplayName("Should process ML result, persist InspectionResult, and mark inspection as COMPLETED")
    void processMLResult_Success() {
        when(inspectionRepository.findByIdWithDetails(sampleInspectionId)).thenReturn(Optional.of(sampleInspection));
        when(resultRepository.existsByInspectionId(sampleInspectionId)).thenReturn(false);
        when(resultRepository.save(any(InspectionResult.class))).thenAnswer(invocation -> {
            InspectionResult res = invocation.getArgument(0);
            res.setId(100L);
            return res;
        });

        MLInspectionResultRequest request = new MLInspectionResultRequest(
                Map.of("score", 85.0, "wasteDetected", false),
                Map.of("score", 92.0, "classroomsChecked", 24),
                Map.of("score", 90.0, "connectedComputers", 50),
                89.0,
                "1.0.0"
        );

        InspectionResultResponse response = resultService.processMLResult(
                sampleInspectionId,
                request,
                Map.of("rawKey", "rawValue"),
                "ml_service@sih.gov.in"
        );

        assertThat(response).isNotNull();
        assertThat(response.finalScore()).isEqualTo(89.0);
        assertThat(response.modelVersion()).isEqualTo("1.0.0");
        assertThat(sampleInspection.getStatus()).isEqualTo(InspectionStatus.COMPLETED);
        assertThat(sampleInspection.getCompletedAt()).isNotNull();

        verify(resultRepository).save(any(InspectionResult.class));
        verify(inspectionRepository).save(sampleInspection);
        verify(auditService).recordEvent(eq(sampleInspectionId), eq("ML_RESULT_RECEIVED"), eq("ml_service@sih.gov.in"), any());
        verify(auditService).recordEvent(eq(sampleInspectionId), eq("INSPECTION_COMPLETED"), eq("ml_service@sih.gov.in"), any());
    }

    @Test
    @DisplayName("Should reject duplicate ML result submission when inspection is already COMPLETED")
    void processMLResult_ThrowsDuplicateException_WhenAlreadyCompleted() {
        sampleInspection.setStatus(InspectionStatus.COMPLETED);
        when(inspectionRepository.findByIdWithDetails(sampleInspectionId)).thenReturn(Optional.of(sampleInspection));

        MLInspectionResultRequest request = new MLInspectionResultRequest(null, null, null, 85.0, "1.0.0");

        assertThatThrownBy(() -> resultService.processMLResult(sampleInspectionId, request, null, "ml_service@sih.gov.in"))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Inspection already has a finalized result");
    }

    @Test
    @DisplayName("Should reject ML result submission when inspection is still in REQUESTED status")
    void processMLResult_ThrowsIllegalArgument_WhenStillRequested() {
        sampleInspection.setStatus(InspectionStatus.REQUESTED);
        when(inspectionRepository.findByIdWithDetails(sampleInspectionId)).thenReturn(Optional.of(sampleInspection));

        MLInspectionResultRequest request = new MLInspectionResultRequest(null, null, null, 85.0, "1.0.0");

        assertThatThrownBy(() -> resultService.processMLResult(sampleInspectionId, request, null, "ml_service@sih.gov.in"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Inspection is in REQUESTED status. It must be started first.");
    }

    @Test
    @DisplayName("Should reject ML result when final score is out of range (< 0.0 or > 100.0)")
    void processMLResult_ThrowsIllegalArgument_WhenScoreOutOfRange() {
        when(inspectionRepository.findByIdWithDetails(sampleInspectionId)).thenReturn(Optional.of(sampleInspection));

        MLInspectionResultRequest requestInvalid = new MLInspectionResultRequest(null, null, null, 105.0, "1.0.0");

        assertThatThrownBy(() -> resultService.processMLResult(sampleInspectionId, requestInvalid, null, "ml_service@sih.gov.in"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Final score must be between 0.0 and 100.0");
    }

    @Test
    @DisplayName("Should retrieve result by inspection ID for owner institute")
    void getResultByInspectionId_Success() {
        InspectionResult result = new InspectionResult(sampleInspection, Map.of(), Map.of(), Map.of(), Map.of(), 88.5, "1.0.0");
        result.setId(50L);

        when(inspectionRepository.findByIdWithDetails(sampleInspectionId)).thenReturn(Optional.of(sampleInspection));
        when(resultRepository.findByInspectionId(sampleInspectionId)).thenReturn(Optional.of(result));

        InspectionResultResponse response = resultService.getResultByInspectionId(sampleInspectionId, "institute@sih.gov.in", Role.INSTITUTE);

        assertThat(response).isNotNull();
        assertThat(response.finalScore()).isEqualTo(88.5);
    }

    @Test
    @DisplayName("Should reject result retrieval when requested by a different institute")
    void getResultByInspectionId_ThrowsAccessDenied_WhenOtherInstitute() {
        when(inspectionRepository.findByIdWithDetails(sampleInspectionId)).thenReturn(Optional.of(sampleInspection));

        assertThatThrownBy(() -> resultService.getResultByInspectionId(sampleInspectionId, "other_institute@sih.gov.in", Role.INSTITUTE))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Access denied");
    }
}
