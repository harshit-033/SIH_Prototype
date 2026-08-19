package com.sih.inspection.inspector.service;

import com.sih.inspection.auth.entity.AccountStatus;
import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.auth.entity.User;
import com.sih.inspection.auth.repository.UserRepository;
import com.sih.inspection.exception.DuplicateResourceException;
import com.sih.inspection.exception.ResourceNotFoundException;
import com.sih.inspection.inspector.dto.CreateInspectorRequest;
import com.sih.inspection.inspector.dto.InspectorResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InspectorServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private InspectorService inspectorService;

    private User sampleInspector;

    @BeforeEach
    void setUp() {
        sampleInspector = new User(
                1L,
                "inspector1@sih.gov.in",
                "encodedPasswordHash",
                Role.INSPECTOR,
                AccountStatus.ACTIVE,
                Instant.now(),
                Instant.now()
        );
    }

    @Test
    @DisplayName("Should create inspector successfully with Role.INSPECTOR and AccountStatus.ACTIVE")
    void createInspector_Success() {
        CreateInspectorRequest request = new CreateInspectorRequest(
                "inspector1@sih.gov.in",
                "Password@123"
        );

        when(userRepository.existsByEmailIgnoreCase("inspector1@sih.gov.in")).thenReturn(false);
        when(passwordEncoder.encode("Password@123")).thenReturn("encodedPasswordHash");
        when(userRepository.save(any(User.class))).thenReturn(sampleInspector);

        InspectorResponse response = inspectorService.createInspector(request);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("inspector1@sih.gov.in", response.email());
        assertEquals(Role.INSPECTOR, response.role());
        assertEquals(AccountStatus.ACTIVE, response.status());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals("inspector1@sih.gov.in", savedUser.getEmail());
        assertEquals("encodedPasswordHash", savedUser.getPassword());
        assertEquals(Role.INSPECTOR, savedUser.getRole());
        assertEquals(AccountStatus.ACTIVE, savedUser.getStatus());
    }

    @Test
    @DisplayName("Should trim and normalize email to lowercase when creating inspector")
    void createInspector_NormalizesEmail() {
        CreateInspectorRequest request = new CreateInspectorRequest(
                "   NEW.INSPECTOR@SIH.GOV.IN   ",
                "Password@123"
        );

        when(userRepository.existsByEmailIgnoreCase("new.inspector@sih.gov.in")).thenReturn(false);
        when(passwordEncoder.encode("Password@123")).thenReturn("encodedPasswordHash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(2L);
            return user;
        });

        InspectorResponse response = inspectorService.createInspector(request);

        assertNotNull(response);
        assertEquals("new.inspector@sih.gov.in", response.email());
        assertEquals(Role.INSPECTOR, response.role());
        verify(userRepository).existsByEmailIgnoreCase("new.inspector@sih.gov.in");
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when email is already registered")
    void createInspector_DuplicateEmail_ThrowsDuplicateResourceException() {
        CreateInspectorRequest request = new CreateInspectorRequest(
                "existing@sih.gov.in",
                "Password@123"
        );

        when(userRepository.existsByEmailIgnoreCase("existing@sih.gov.in")).thenReturn(true);

        DuplicateResourceException ex = assertThrows(
                DuplicateResourceException.class,
                () -> inspectorService.createInspector(request)
        );

        assertTrue(ex.getMessage().contains("User already exists with email: existing@sih.gov.in"));
        verify(userRepository, never()).save(any(User.class));
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    @DisplayName("Should retrieve all registered inspectors")
    void getAllInspectors_Success() {
        User inspector2 = new User(
                2L,
                "inspector2@sih.gov.in",
                "hash2",
                Role.INSPECTOR,
                AccountStatus.ACTIVE,
                Instant.now(),
                Instant.now()
        );

        when(userRepository.findAllByRoleOrderByIdAsc(Role.INSPECTOR)).thenReturn(List.of(sampleInspector, inspector2));

        List<InspectorResponse> list = inspectorService.getAllInspectors();

        assertEquals(2, list.size());
        assertEquals("inspector1@sih.gov.in", list.get(0).email());
        assertEquals(Role.INSPECTOR, list.get(0).role());
        assertEquals("inspector2@sih.gov.in", list.get(1).email());
        assertEquals(Role.INSPECTOR, list.get(1).role());
    }

    @Test
    @DisplayName("Should retrieve inspector by ID when user exists and has ROLE_INSPECTOR")
    void getInspectorById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleInspector));

        InspectorResponse response = inspectorService.getInspectorById(1L);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("inspector1@sih.gov.in", response.email());
        assertEquals(Role.INSPECTOR, response.role());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when inspector user ID does not exist")
    void getInspectorById_NotFound_ThrowsResourceNotFoundException() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> inspectorService.getInspectorById(999L)
        );

        assertTrue(ex.getMessage().contains("Inspector not found with id: 999"));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user exists but has a different role")
    void getInspectorById_WrongRole_ThrowsResourceNotFoundException() {
        User adminUser = new User(
                5L,
                "admin@sih.gov.in",
                "adminHash",
                Role.ADMIN,
                AccountStatus.ACTIVE,
                Instant.now(),
                Instant.now()
        );

        when(userRepository.findById(5L)).thenReturn(Optional.of(adminUser));

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> inspectorService.getInspectorById(5L)
        );

        assertTrue(ex.getMessage().contains("Inspector not found with id: 5"));
    }
}
