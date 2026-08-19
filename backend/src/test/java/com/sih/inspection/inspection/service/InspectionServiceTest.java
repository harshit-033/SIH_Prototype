package com.sih.inspection.inspection.service;

import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.exception.ResourceNotFoundException;
import com.sih.inspection.inspection.dto.CreateInspectionRequest;
import com.sih.inspection.inspection.dto.InspectionResponse;
import com.sih.inspection.inspection.entity.Inspection;
import com.sih.inspection.inspection.enums.InspectionStatus;
import com.sih.inspection.inspection.enums.InspectionType;
import com.sih.inspection.inspection.repository.InspectionRepository;
import com.sih.inspection.institute.entity.Institute;
import com.sih.inspection.institute.entity.InstituteStatus;
import com.sih.inspection.institute.repository.InstituteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InspectionServiceTest {

    @Mock
    private InspectionRepository inspectionRepository;

    @Mock
    private InstituteRepository instituteRepository;

    @Mock
    private InspectionNumberGenerator numberGenerator;

    @Mock
    private InspectionAuditService auditService;

    @InjectMocks
    private InspectionService inspectionService;

    private Institute activeInstitute;
    private Institute inactiveInstitute;
    private Inspection sampleInspection;
    private UUID sampleId;

    @BeforeEach
    void setup() {
        activeInstitute = new Institute("Delhi Engineering College", "DEC001", "Ring Road", "North", "Delhi", "Delhi", "institute@sih.gov.in", "9876543210", InstituteStatus.ACTIVE);
        activeInstitute.setId(10L);

        inactiveInstitute = new Institute("Inactive College", "INA001", "Road", "North", "Delhi", "Delhi", "inactive@sih.gov.in", "9876543211", InstituteStatus.INACTIVE);
        inactiveInstitute.setId(11L);

        sampleId = UUID.randomUUID();
        sampleInspection = new Inspection("INS-2026-000001", activeInstitute, InspectionType.FULL_INSPECTION);
        sampleInspection.setId(sampleId);
    }

    @Test
    @DisplayName("Should create inspection successfully when requested by active institute")
    void createInspection_Success_AsInstitute() {
        when(instituteRepository.findByContactEmailIgnoreCase("institute@sih.gov.in")).thenReturn(Optional.of(activeInstitute));
        when(numberGenerator.generateNextInspectionNumber()).thenReturn("INS-2026-000001");
        when(inspectionRepository.save(any(Inspection.class))).thenAnswer(invocation -> {
            Inspection ins = invocation.getArgument(0);
            ins.setId(sampleId);
            return ins;
        });

        CreateInspectionRequest request = new CreateInspectionRequest(InspectionType.FULL_INSPECTION);
        InspectionResponse response = inspectionService.createInspection(request, "institute@sih.gov.in", Role.INSTITUTE);

        assertThat(response).isNotNull();
        assertThat(response.inspectionNumber()).isEqualTo("INS-2026-000001");
        assertThat(response.status()).isEqualTo(InspectionStatus.REQUESTED);
        assertThat(response.institute().name()).isEqualTo("Delhi Engineering College");

        verify(auditService).recordEvent(eq(sampleId), eq("INSPECTION_CREATED"), eq("institute@sih.gov.in"), any());
    }

    @Test
    @DisplayName("Should create inspection successfully when requested by ADMIN with instituteId")
    void createInspection_Success_AsAdmin_WithInstituteId() {
        when(instituteRepository.findById(10L)).thenReturn(Optional.of(activeInstitute));
        when(numberGenerator.generateNextInspectionNumber()).thenReturn("INS-2026-000002");
        when(inspectionRepository.save(any(Inspection.class))).thenAnswer(invocation -> {
            Inspection ins = invocation.getArgument(0);
            ins.setId(sampleId);
            return ins;
        });

        CreateInspectionRequest request = new CreateInspectionRequest(InspectionType.FULL_INSPECTION, 10L);
        InspectionResponse response = inspectionService.createInspection(request, "admin@sih.gov.in", Role.ADMIN);

        assertThat(response).isNotNull();
        assertThat(response.inspectionNumber()).isEqualTo("INS-2026-000002");
        assertThat(response.status()).isEqualTo(InspectionStatus.REQUESTED);
    }

    @Test
    @DisplayName("Should reject inspection creation for inactive institute")
    void createInspection_ThrowsException_WhenInstituteInactive() {
        when(instituteRepository.findByContactEmailIgnoreCase("inactive@sih.gov.in")).thenReturn(Optional.of(inactiveInstitute));

        CreateInspectionRequest request = new CreateInspectionRequest(InspectionType.FULL_INSPECTION);

        assertThatThrownBy(() -> inspectionService.createInspection(request, "inactive@sih.gov.in", Role.INSTITUTE))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("inactive institute");
    }

    @Test
    @DisplayName("Should start inspection (REQUESTED -> PROCESSING) successfully")
    void startInspection_Success() {
        when(inspectionRepository.findByIdWithDetails(sampleId)).thenReturn(Optional.of(sampleInspection));
        when(inspectionRepository.save(any(Inspection.class))).thenReturn(sampleInspection);

        InspectionResponse response = inspectionService.startInspection(sampleId, "admin@sih.gov.in", Role.ADMIN);

        assertThat(response.status()).isEqualTo(InspectionStatus.PROCESSING);
        assertThat(sampleInspection.getStartedAt()).isNotNull();

        verify(auditService).recordEvent(eq(sampleId), eq("INSPECTION_STARTED"), eq("admin@sih.gov.in"), any());
    }

    @Test
    @DisplayName("Should throw exception when attempting to start an already COMPLETED inspection")
    void startInspection_ThrowsException_WhenCompleted() {
        sampleInspection.setStatus(InspectionStatus.COMPLETED);
        when(inspectionRepository.findByIdWithDetails(sampleId)).thenReturn(Optional.of(sampleInspection));

        assertThatThrownBy(() -> inspectionService.startInspection(sampleId, "admin@sih.gov.in", Role.ADMIN))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cannot start inspection in status: COMPLETED");
    }

    @Test
    @DisplayName("Should cancel inspection (REQUESTED -> CANCELLED) successfully")
    void cancelInspection_Success() {
        when(inspectionRepository.findByIdWithDetails(sampleId)).thenReturn(Optional.of(sampleInspection));
        when(inspectionRepository.save(any(Inspection.class))).thenReturn(sampleInspection);

        InspectionResponse response = inspectionService.cancelInspection(sampleId, "Postponed", "institute@sih.gov.in", Role.INSTITUTE);

        assertThat(response.status()).isEqualTo(InspectionStatus.CANCELLED);
        assertThat(sampleInspection.getCancelledAt()).isNotNull();
        assertThat(sampleInspection.getFailureReason()).isEqualTo("Postponed");
    }

    @Test
    @DisplayName("Should throw exception when attempting to cancel a PROCESSING inspection")
    void cancelInspection_ThrowsException_WhenProcessing() {
        sampleInspection.setStatus(InspectionStatus.PROCESSING);
        when(inspectionRepository.findByIdWithDetails(sampleId)).thenReturn(Optional.of(sampleInspection));

        assertThatThrownBy(() -> inspectionService.cancelInspection(sampleId, "reason", "institute@sih.gov.in", Role.INSTITUTE))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cannot cancel inspection in status: PROCESSING");
    }

    @Test
    @DisplayName("Should retrieve inspection by ID for authorized institute")
    void getInspectionById_Success_Owner() {
        when(inspectionRepository.findByIdWithDetails(sampleId)).thenReturn(Optional.of(sampleInspection));

        InspectionResponse response = inspectionService.getInspectionById(sampleId, "institute@sih.gov.in", Role.INSTITUTE);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(sampleId);
    }

    @Test
    @DisplayName("Should deny access when institute tries to access another institute's inspection")
    void getInspectionById_ThrowsAccessDenied_WhenOtherInstitute() {
        when(inspectionRepository.findByIdWithDetails(sampleId)).thenReturn(Optional.of(sampleInspection));

        assertThatThrownBy(() -> inspectionService.getInspectionById(sampleId, "other_institute@sih.gov.in", Role.INSTITUTE))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Access denied: You cannot view or modify an inspection belonging to another institute");
    }

    @Test
    @DisplayName("Should isolate inspections listing to only owned institute records for INSTITUTE role")
    void listInspections_IsolatesToOwnedInstitute() {
        when(instituteRepository.findByContactEmailIgnoreCase("institute@sih.gov.in")).thenReturn(Optional.of(activeInstitute));
        PageRequest pageRequest = PageRequest.of(0, 10);
        when(inspectionRepository.findByInstituteId(10L, pageRequest))
                .thenReturn(new PageImpl<>(List.of(sampleInspection)));

        Page<InspectionResponse> page = inspectionService.listInspections(pageRequest, null, null, "institute@sih.gov.in", Role.INSTITUTE);

        assertThat(page.getContent()).hasSize(1);
        verify(inspectionRepository).findByInstituteId(10L, pageRequest);
        verify(inspectionRepository, never()).findAll(any(PageRequest.class));
    }
}
