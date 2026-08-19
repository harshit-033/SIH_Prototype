package com.sih.inspection.auth;

import com.sih.inspection.auth.dto.LoginRequest;
import com.sih.inspection.auth.dto.LoginResponse;
import com.sih.inspection.auth.entity.AccountStatus;
import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.auth.entity.User;
import com.sih.inspection.auth.repository.UserRepository;
import com.sih.inspection.auth.service.AuthService;
import com.sih.inspection.exception.DuplicateResourceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("local")
class SingleAdminInvariantTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.sih.inspection.assignment.repository.InspectorInstituteAssignmentRepository assignmentRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void setUp() {
        assignmentRepository.deleteAll();
        userRepository.deleteAll();
        authService.seedDefaultUsers();
    }

    @Test
    @DisplayName("Invariant Check: Exactly ONE ADMIN exists in the database")
    void exactlyOneAdminExists() {
        long adminCount = userRepository.countByRole(Role.ADMIN);
        assertEquals(1, adminCount, "System must contain exactly ONE ADMIN account");
    }

    @Test
    @DisplayName("Invariant Check: Attempting to create a second ADMIN throws DuplicateResourceException (409)")
    void attemptCreateSecondAdmin_ThrowsDuplicateResourceException() {
        User secondAdmin = new User(
                "second.admin@sih.gov.in",
                passwordEncoder.encode("Password@123"),
                Role.ADMIN,
                AccountStatus.ACTIVE
        );

        DuplicateResourceException ex = assertThrows(
                DuplicateResourceException.class,
                () -> authService.validateSingleAdminInvariant(secondAdmin)
        );

        assertTrue(ex.getMessage().contains("Only one ADMIN is permitted in the system"));
        assertEquals(1, userRepository.countByRole(Role.ADMIN));
    }

    @Test
    @DisplayName("Invariant Check: Attempting to promote an INSPECTOR to ADMIN throws DuplicateResourceException")
    void attemptPromoteInspectorToAdmin_ThrowsDuplicateResourceException() {
        User inspector = userRepository.findByEmailIgnoreCase("inspector@sih.gov.in").orElseThrow();
        inspector.setRole(Role.ADMIN);

        DuplicateResourceException ex = assertThrows(
                DuplicateResourceException.class,
                () -> authService.validateSingleAdminInvariant(inspector)
        );

        assertTrue(ex.getMessage().contains("Only one ADMIN is permitted in the system"));
    }

    @Test
    @DisplayName("Invariant Check: Attempting to promote an INSTITUTE user to ADMIN throws DuplicateResourceException")
    void attemptPromoteInstituteToAdmin_ThrowsDuplicateResourceException() {
        User instituteUser = userRepository.findByEmailIgnoreCase("institute@sih.gov.in").orElseThrow();
        instituteUser.setRole(Role.ADMIN);

        DuplicateResourceException ex = assertThrows(
                DuplicateResourceException.class,
                () -> authService.validateSingleAdminInvariant(instituteUser)
        );

        assertTrue(ex.getMessage().contains("Only one ADMIN is permitted in the system"));
    }

    @Test
    @DisplayName("Invariant Check: Repeated seed executions maintain exactly ONE ADMIN account")
    void repeatedSeedCalls_MaintainExactlyOneAdmin() {
        authService.seedDefaultUsers();
        authService.seedDefaultUsers();
        authService.seedDefaultUsers();

        long adminCount = userRepository.countByRole(Role.ADMIN);
        assertEquals(1, adminCount, "Multiple seed invocations must remain strictly idempotent with 1 ADMIN");
    }

    @Test
    @DisplayName("Invariant Check: Database storage-level constraint (partial unique index) blocks concurrent raw SQL insert")
    void databaseLevelConstraint_PreventsDirectInsertOfSecondAdmin() {
        assertThrows(DataIntegrityViolationException.class, () -> {
            jdbcTemplate.execute(
                    "INSERT INTO users (email, password, role, status, created_at, updated_at) " +
                            "VALUES ('rogue.admin@sih.gov.in', 'hash', 'ADMIN', 'ACTIVE', NOW(), NOW())"
            );
        });

        assertEquals(1, userRepository.countByRole(Role.ADMIN));
    }

    @Test
    @DisplayName("Invariant Check: Existing single ADMIN logs in normally and receives valid JWT")
    void existingAdmin_LogsInSuccessfully() {
        LoginResponse response = authService.login(new LoginRequest("admin@sih.gov.in", "Password@123"));

        assertNotNull(response);
        assertNotNull(response.token());
        assertEquals("admin@sih.gov.in", response.email());
        assertEquals(Role.ADMIN, response.role());
    }
}
