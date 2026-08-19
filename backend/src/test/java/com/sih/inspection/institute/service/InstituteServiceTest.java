package com.sih.inspection.institute.service;

import com.sih.inspection.exception.DuplicateResourceException;
import com.sih.inspection.exception.ResourceNotFoundException;
import com.sih.inspection.institute.dto.CreateInstituteRequest;
import com.sih.inspection.institute.dto.InstituteResponse;
import com.sih.inspection.institute.dto.UpdateInstituteRequest;
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
class InstituteServiceTest {

    @Mock
    private InstituteRepository instituteRepository;

    @InjectMocks
    private InstituteService instituteService;

    private Institute sampleInstitute;

    @BeforeEach
    void setUp() {
        sampleInstitute = new Institute(
                1L,
                "ABC Institute of Technology",
                "ABCIT001",
                "Knowledge Park, Greater Noida",
                "NCR",
                "Greater Noida",
                "Uttar Pradesh",
                "contact@abcit.edu.in",
                "9876543210",
                InstituteStatus.ACTIVE,
                Instant.now(),
                Instant.now()
        );
    }

    @Test
    @DisplayName("Should create institute successfully when code and email are unique")
    void createInstitute_Success() {
        CreateInstituteRequest request = new CreateInstituteRequest(
                "ABC Institute of Technology",
                "ABCIT001",
                "Knowledge Park, Greater Noida",
                "NCR",
                "Greater Noida",
                "Uttar Pradesh",
                "contact@abcit.edu.in",
                "9876543210",
                InstituteStatus.ACTIVE
        );

        when(instituteRepository.existsByCodeIgnoreCase("ABCIT001")).thenReturn(false);
        when(instituteRepository.existsByContactEmailIgnoreCase("contact@abcit.edu.in")).thenReturn(false);
        when(instituteRepository.save(any(Institute.class))).thenReturn(sampleInstitute);

        InstituteResponse response = instituteService.createInstitute(request);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("ABC Institute of Technology", response.name());
        assertEquals("ABCIT001", response.code());
        assertEquals(InstituteStatus.ACTIVE, response.status());
        verify(instituteRepository).save(any(Institute.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when institute code already exists")
    void createInstitute_DuplicateCode_ThrowsException() {
        CreateInstituteRequest request = new CreateInstituteRequest(
                "ABC Institute of Technology",
                "ABCIT001",
                "Knowledge Park, Greater Noida",
                "NCR",
                "Greater Noida",
                "Uttar Pradesh",
                "contact@abcit.edu.in",
                "9876543210",
                InstituteStatus.ACTIVE
        );

        when(instituteRepository.existsByCodeIgnoreCase("ABCIT001")).thenReturn(true);

        DuplicateResourceException ex = assertThrows(
                DuplicateResourceException.class,
                () -> instituteService.createInstitute(request)
        );

        assertTrue(ex.getMessage().contains("ABCIT001"));
        verify(instituteRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when contact email already exists")
    void createInstitute_DuplicateEmail_ThrowsException() {
        CreateInstituteRequest request = new CreateInstituteRequest(
                "ABC Institute of Technology",
                "ABCIT001",
                "Knowledge Park, Greater Noida",
                "NCR",
                "Greater Noida",
                "Uttar Pradesh",
                "contact@abcit.edu.in",
                "9876543210",
                InstituteStatus.ACTIVE
        );

        when(instituteRepository.existsByCodeIgnoreCase("ABCIT001")).thenReturn(false);
        when(instituteRepository.existsByContactEmailIgnoreCase("contact@abcit.edu.in")).thenReturn(true);

        DuplicateResourceException ex = assertThrows(
                DuplicateResourceException.class,
                () -> instituteService.createInstitute(request)
        );

        assertTrue(ex.getMessage().contains("contact@abcit.edu.in"));
        verify(instituteRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should retrieve institute by ID successfully")
    void getInstituteById_Success() {
        when(instituteRepository.findById(1L)).thenReturn(Optional.of(sampleInstitute));

        InstituteResponse response = instituteService.getInstituteById(1L);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("ABCIT001", response.code());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when institute ID does not exist")
    void getInstituteById_NotFound_ThrowsException() {
        when(instituteRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> instituteService.getInstituteById(99L)
        );

        assertTrue(ex.getMessage().contains("99"));
    }

    @Test
    @DisplayName("Should retrieve all institutes")
    void getAllInstitutes_Success() {
        when(instituteRepository.findAll()).thenReturn(List.of(sampleInstitute));

        List<InstituteResponse> list = instituteService.getAllInstitutes();

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("ABCIT001", list.get(0).code());
    }

    @Test
    @DisplayName("Should update institute successfully when code and email are unique")
    void updateInstitute_Success() {
        UpdateInstituteRequest updateRequest = new UpdateInstituteRequest(
                "ABC University of Technology",
                "ABCIT002",
                "Sector 62, Noida",
                "NCR",
                "Noida",
                "Uttar Pradesh",
                "admin@abcit.edu.in",
                "9123456789",
                InstituteStatus.ACTIVE
        );

        when(instituteRepository.findById(1L)).thenReturn(Optional.of(sampleInstitute));
        when(instituteRepository.existsByCodeIgnoreCaseAndIdNot("ABCIT002", 1L)).thenReturn(false);
        when(instituteRepository.existsByContactEmailIgnoreCaseAndIdNot("admin@abcit.edu.in", 1L)).thenReturn(false);
        when(instituteRepository.save(any(Institute.class))).thenAnswer(i -> i.getArgument(0));

        InstituteResponse response = instituteService.updateInstitute(1L, updateRequest);

        assertNotNull(response);
        assertEquals("ABC University of Technology", response.name());
        assertEquals("ABCIT002", response.code());
        assertEquals("admin@abcit.edu.in", response.contactEmail());
        verify(instituteRepository).save(sampleInstitute);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when updating non-existent institute")
    void updateInstitute_NotFound_ThrowsException() {
        UpdateInstituteRequest updateRequest = new UpdateInstituteRequest(
                "ABC University", "ABCIT001", "Addr", "NCR", "Noida", "UP", "c@a.edu", "9876543210", InstituteStatus.ACTIVE
        );

        when(instituteRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> instituteService.updateInstitute(99L, updateRequest)
        );

        verify(instituteRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when updating with duplicate code")
    void updateInstitute_DuplicateCode_ThrowsException() {
        UpdateInstituteRequest updateRequest = new UpdateInstituteRequest(
                "ABC University", "DUPLICATE001", "Addr", "NCR", "Noida", "UP", "c@a.edu", "9876543210", InstituteStatus.ACTIVE
        );

        when(instituteRepository.findById(1L)).thenReturn(Optional.of(sampleInstitute));
        when(instituteRepository.existsByCodeIgnoreCaseAndIdNot("DUPLICATE001", 1L)).thenReturn(true);

        DuplicateResourceException ex = assertThrows(
                DuplicateResourceException.class,
                () -> instituteService.updateInstitute(1L, updateRequest)
        );

        assertTrue(ex.getMessage().contains("DUPLICATE001"));
        verify(instituteRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when updating with duplicate email")
    void updateInstitute_DuplicateEmail_ThrowsException() {
        UpdateInstituteRequest updateRequest = new UpdateInstituteRequest(
                "ABC University", "ABCIT001", "Addr", "NCR", "Noida", "UP", "duplicate@other.edu", "9876543210", InstituteStatus.ACTIVE
        );

        when(instituteRepository.findById(1L)).thenReturn(Optional.of(sampleInstitute));
        when(instituteRepository.existsByCodeIgnoreCaseAndIdNot("ABCIT001", 1L)).thenReturn(false);
        when(instituteRepository.existsByContactEmailIgnoreCaseAndIdNot("duplicate@other.edu", 1L)).thenReturn(true);

        DuplicateResourceException ex = assertThrows(
                DuplicateResourceException.class,
                () -> instituteService.updateInstitute(1L, updateRequest)
        );

        assertTrue(ex.getMessage().contains("duplicate@other.edu"));
        verify(instituteRepository, never()).save(any());
    }
}
