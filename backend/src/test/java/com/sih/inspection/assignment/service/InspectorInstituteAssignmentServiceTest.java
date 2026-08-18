package com.sih.inspection.assignment.service;

import com.sih.inspection.assignment.dto.AssignmentResponse;
import com.sih.inspection.assignment.dto.AssignmentSummaryResponse;
import com.sih.inspection.assignment.dto.CreateAssignmentRequest;
import com.sih.inspection.assignment.dto.InspectorSummaryResponse;
import com.sih.inspection.assignment.entity.AssignmentStatus;
import com.sih.inspection.assignment.entity.InspectorInstituteAssignment;
import com.sih.inspection.assignment.repository.InspectorInstituteAssignmentRepository;
import com.sih.inspection.auth.entity.AccountStatus;
import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.auth.entity.User;
import com.sih.inspection.auth.repository.UserRepository;
import com.sih.inspection.exception.DuplicateResourceException;
import com.sih.inspection.exception.ResourceNotFoundException;
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

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InspectorInstituteAssignmentServiceTest {

    @Mock
    private InspectorInstituteAssignmentRepository assignmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private InstituteRepository instituteRepository;

    @InjectMocks
    private InspectorInstituteAssignmentService assignmentService;

    private User inspector;
    private Institute institute;
    private InspectorInstituteAssignment assignment;

    @BeforeEach
    void setUp() {
        inspector = new User(10L, "inspector@sih.gov.in", "hash", Role.INSPECTOR, AccountStatus.ACTIVE, Instant.now(), Instant.now());
        institute = new Institute(20L, "ABC Institute of Technology", "ABC001", "Address", "NCR", "Noida", "UP", "c@a.edu", "9876543210", InstituteStatus.ACTIVE, Instant.now(), Instant.now());
        assignment = new InspectorInstituteAssignment(100L, inspector, institute, AssignmentStatus.ACTIVE, Instant.now(), null, Instant.now(), Instant.now());
    }

    @Test
    @DisplayName("Should create assignment successfully when inspector is ACTIVE and institute has no active inspector")
    void createAssignment_Success() {
        CreateAssignmentRequest request = new CreateAssignmentRequest(10L, 20L);

        when(userRepository.findById(10L)).thenReturn(Optional.of(inspector));
        when(instituteRepository.findById(20L)).thenReturn(Optional.of(institute));
        when(assignmentRepository.existsByInstituteIdAndStatus(20L, AssignmentStatus.ACTIVE)).thenReturn(false);
        when(assignmentRepository.save(any(InspectorInstituteAssignment.class))).thenReturn(assignment);

        AssignmentResponse response = assignmentService.createAssignment(request);

        assertNotNull(response);
        assertEquals(100L, response.id());
        assertEquals(AssignmentStatus.ACTIVE, response.status());
        assertEquals("inspector@sih.gov.in", response.inspector().email());
        assertEquals("ABC Institute of Technology", response.institute().name());
        verify(assignmentRepository).save(any(InspectorInstituteAssignment.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when inspector user does not exist")
    void createAssignment_InspectorNotFound_ThrowsException() {
        CreateAssignmentRequest request = new CreateAssignmentRequest(999L, 20L);

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> assignmentService.createAssignment(request));
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when institute does not exist")
    void createAssignment_InstituteNotFound_ThrowsException() {
        CreateAssignmentRequest request = new CreateAssignmentRequest(10L, 999L);

        when(userRepository.findById(10L)).thenReturn(Optional.of(inspector));
        when(instituteRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> assignmentService.createAssignment(request));
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when assigned user is an ADMIN")
    void createAssignment_AdminUser_ThrowsException() {
        User admin = new User(1L, "admin@sih.gov.in", "hash", Role.ADMIN, AccountStatus.ACTIVE, Instant.now(), Instant.now());
        CreateAssignmentRequest request = new CreateAssignmentRequest(1L, 20L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> assignmentService.createAssignment(request));
        assertTrue(ex.getMessage().contains("ADMIN"));
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when assigned user is an INSTITUTE representative")
    void createAssignment_InstituteUser_ThrowsException() {
        User instituteUser = new User(2L, "inst@sih.gov.in", "hash", Role.INSTITUTE, AccountStatus.ACTIVE, Instant.now(), Instant.now());
        CreateAssignmentRequest request = new CreateAssignmentRequest(2L, 20L);

        when(userRepository.findById(2L)).thenReturn(Optional.of(instituteUser));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> assignmentService.createAssignment(request));
        assertTrue(ex.getMessage().contains("INSTITUTE"));
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when inspector is DISABLED")
    void createAssignment_DisabledInspector_ThrowsException() {
        User disabledInspector = new User(10L, "inspector@sih.gov.in", "hash", Role.INSPECTOR, AccountStatus.DISABLED, Instant.now(), Instant.now());
        CreateAssignmentRequest request = new CreateAssignmentRequest(10L, 20L);

        when(userRepository.findById(10L)).thenReturn(Optional.of(disabledInspector));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> assignmentService.createAssignment(request));
        assertTrue(ex.getMessage().contains("DISABLED"));
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when institute is INACTIVE")
    void createAssignment_InactiveInstitute_ThrowsException() {
        Institute inactiveInstitute = new Institute(20L, "ABC Institute", "ABC001", "Addr", "NCR", "Noida", "UP", "c@a.edu", "9876543210", InstituteStatus.INACTIVE, Instant.now(), Instant.now());
        CreateAssignmentRequest request = new CreateAssignmentRequest(10L, 20L);

        when(userRepository.findById(10L)).thenReturn(Optional.of(inspector));
        when(instituteRepository.findById(20L)).thenReturn(Optional.of(inactiveInstitute));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> assignmentService.createAssignment(request));
        assertTrue(ex.getMessage().contains("INACTIVE"));
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when institute already has an active inspector")
    void createAssignment_DuplicateActiveInspectorOnInstitute_ThrowsException() {
        CreateAssignmentRequest request = new CreateAssignmentRequest(10L, 20L);

        when(userRepository.findById(10L)).thenReturn(Optional.of(inspector));
        when(instituteRepository.findById(20L)).thenReturn(Optional.of(institute));
        when(assignmentRepository.existsByInstituteIdAndStatus(20L, AssignmentStatus.ACTIVE)).thenReturn(true);

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class, () -> assignmentService.createAssignment(request));
        assertTrue(ex.getMessage().contains("already has an active inspector assigned"));
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should retrieve my active assignments for the authenticated inspector")
    void getMyAssignments_Success() {
        when(userRepository.findByEmailIgnoreCase("inspector@sih.gov.in")).thenReturn(Optional.of(inspector));
        when(assignmentRepository.findByInspectorIdAndStatus(10L, AssignmentStatus.ACTIVE)).thenReturn(List.of(assignment));

        List<AssignmentSummaryResponse> list = assignmentService.getMyAssignments("inspector@sih.gov.in");

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("ABC001", list.get(0).instituteCode());
    }

    @Test
    @DisplayName("Should retrieve active inspector for an institute")
    void getInspectorForInstitute_Success() {
        when(instituteRepository.existsById(20L)).thenReturn(true);
        when(assignmentRepository.findByInstituteIdAndStatus(20L, AssignmentStatus.ACTIVE)).thenReturn(Optional.of(assignment));

        InspectorSummaryResponse response = assignmentService.getInspectorForInstitute(20L);

        assertNotNull(response);
        assertEquals("inspector@sih.gov.in", response.email());
    }

    @Test
    @DisplayName("Should deactivate active assignment successfully")
    void deactivateAssignment_Success() {
        when(assignmentRepository.findById(100L)).thenReturn(Optional.of(assignment));
        when(assignmentRepository.save(any(InspectorInstituteAssignment.class))).thenAnswer(i -> i.getArgument(0));

        AssignmentResponse response = assignmentService.deactivateAssignment(100L);

        assertNotNull(response);
        assertEquals(AssignmentStatus.INACTIVE, response.status());
        assertNotNull(response.deactivatedAt());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when deactivating already inactive assignment")
    void deactivateAssignment_AlreadyInactive_ThrowsException() {
        assignment.deactivate();
        when(assignmentRepository.findById(100L)).thenReturn(Optional.of(assignment));

        assertThrows(IllegalArgumentException.class, () -> assignmentService.deactivateAssignment(100L));
    }
}
