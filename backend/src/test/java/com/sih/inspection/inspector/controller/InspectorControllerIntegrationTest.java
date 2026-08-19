package com.sih.inspection.inspector.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.inspection.assignment.dto.CreateAssignmentRequest;
import com.sih.inspection.assignment.repository.InspectorInstituteAssignmentRepository;
import com.sih.inspection.auth.entity.AccountStatus;
import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.auth.entity.User;
import com.sih.inspection.auth.repository.UserRepository;
import com.sih.inspection.common.ApiResponse;
import com.sih.inspection.inspection.repository.InspectionAuditEventRepository;
import com.sih.inspection.inspection.repository.InspectionRepository;
import com.sih.inspection.inspection.repository.InspectionResultRepository;
import com.sih.inspection.inspector.dto.CreateInspectorRequest;
import com.sih.inspection.institute.entity.Institute;
import com.sih.inspection.institute.entity.InstituteStatus;
import com.sih.inspection.institute.repository.InstituteRepository;
import com.sih.inspection.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Map;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("local")
class InspectorControllerIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InstituteRepository instituteRepository;

    @Autowired
    private InspectorInstituteAssignmentRepository assignmentRepository;

    @Autowired
    private InspectionAuditEventRepository auditEventRepository;

    @Autowired
    private InspectionResultRepository resultRepository;

    @Autowired
    private InspectionRepository inspectionRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    private String adminToken;
    private String inspectorToken;
    private String instituteToken;
    private String mlServiceToken;

    private User admin;
    private User existingInspector;
    private Institute sampleInstitute;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        auditEventRepository.deleteAll();
        resultRepository.deleteAll();
        inspectionRepository.deleteAll();
        assignmentRepository.deleteAll();
        instituteRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Seed Admin
        admin = userRepository.save(new User(
                "admin@sih.gov.in",
                passwordEncoder.encode("SecretPass123!"),
                Role.ADMIN,
                AccountStatus.ACTIVE
        ));
        adminToken = "Bearer " + jwtService.generateToken(admin.getId(), admin.getEmail(), admin.getRole(), admin.getStatus());

        // 2. Seed Existing Inspector
        existingInspector = userRepository.save(new User(
                "inspector@sih.gov.in",
                passwordEncoder.encode("InspectorPass123!"),
                Role.INSPECTOR,
                AccountStatus.ACTIVE
        ));
        inspectorToken = "Bearer " + jwtService.generateToken(existingInspector.getId(), existingInspector.getEmail(), existingInspector.getRole(), existingInspector.getStatus());

        // 3. Seed Institute User
        User instituteUser = userRepository.save(new User(
                "institute@sih.gov.in",
                passwordEncoder.encode("InstitutePass123!"),
                Role.INSTITUTE,
                AccountStatus.ACTIVE
        ));
        instituteToken = "Bearer " + jwtService.generateToken(instituteUser.getId(), instituteUser.getEmail(), instituteUser.getRole(), instituteUser.getStatus());

        // 4. Seed ML Service User
        User mlServiceUser = userRepository.save(new User(
                "ml_service@sih.gov.in",
                passwordEncoder.encode("MlServicePass123!"),
                Role.ML_SERVICE,
                AccountStatus.ACTIVE
        ));
        mlServiceToken = "Bearer " + jwtService.generateToken(mlServiceUser.getId(), mlServiceUser.getEmail(), mlServiceUser.getRole(), mlServiceUser.getStatus());

        // 5. Seed sample institute
        sampleInstitute = instituteRepository.save(new Institute(
                "Delhi Institute of Technology",
                "DIT001",
                "Dwarka, Delhi",
                "North",
                "Delhi",
                "Delhi",
                "dit@sih.gov.in",
                "9876543210",
                InstituteStatus.ACTIVE
        ));
    }

    @Test
    @DisplayName("Test 1: ADMIN creates inspector successfully (201 Created)")
    void createInspector_ByAdmin_Returns201() throws Exception {
        CreateInspectorRequest request = new CreateInspectorRequest(
                "test-inspector@sih.gov.in",
                "TestPassword@123"
        );

        mockMvc.perform(post("/api/v1/inspectors")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Inspector created successfully")))
                .andExpect(jsonPath("$.data.id", notNullValue()))
                .andExpect(jsonPath("$.data.email", is("test-inspector@sih.gov.in")))
                .andExpect(jsonPath("$.data.role", is("INSPECTOR")))
                .andExpect(jsonPath("$.data.status", is("ACTIVE")))
                .andExpect(jsonPath("$.data.password").doesNotExist())
                .andExpect(jsonPath("$.data.passwordHash").doesNotExist());

        // Verify database persistence
        User persisted = userRepository.findByEmailIgnoreCase("test-inspector@sih.gov.in").orElseThrow();
        assertEquals(Role.INSPECTOR, persisted.getRole());
        assertEquals(AccountStatus.ACTIVE, persisted.getStatus());
        assertNotEquals("TestPassword@123", persisted.getPassword());
        assertTrue(passwordEncoder.matches("TestPassword@123", persisted.getPassword()));
    }

    @Test
    @DisplayName("Test 2: INSPECTOR role cannot create inspector (403 Forbidden)")
    void createInspector_ByInspector_Returns403() throws Exception {
        CreateInspectorRequest request = new CreateInspectorRequest(
                "rogue-inspector@sih.gov.in",
                "TestPassword@123"
        );

        mockMvc.perform(post("/api/v1/inspectors")
                        .header("Authorization", inspectorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    @DisplayName("Test 3: INSTITUTE role cannot create inspector (403 Forbidden)")
    void createInspector_ByInstitute_Returns403() throws Exception {
        CreateInspectorRequest request = new CreateInspectorRequest(
                "rogue-inspector@sih.gov.in",
                "TestPassword@123"
        );

        mockMvc.perform(post("/api/v1/inspectors")
                        .header("Authorization", instituteToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    @DisplayName("Test 4: ML_SERVICE role cannot create inspector (403 Forbidden)")
    void createInspector_ByMlService_Returns403() throws Exception {
        CreateInspectorRequest request = new CreateInspectorRequest(
                "rogue-inspector@sih.gov.in",
                "TestPassword@123"
        );

        mockMvc.perform(post("/api/v1/inspectors")
                        .header("Authorization", mlServiceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    @DisplayName("Test 5: Unauthenticated request cannot create inspector (401 Unauthorized)")
    void createInspector_Unauthenticated_Returns401() throws Exception {
        CreateInspectorRequest request = new CreateInspectorRequest(
                "unauth-inspector@sih.gov.in",
                "TestPassword@123"
        );

        mockMvc.perform(post("/api/v1/inspectors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));
    }

    @Test
    @DisplayName("Test 6: Duplicate email creation returns 409 Conflict")
    void createInspector_DuplicateEmail_Returns409() throws Exception {
        // First creation succeeds
        CreateInspectorRequest request = new CreateInspectorRequest(
                "duplicate@sih.gov.in",
                "TestPassword@123"
        );

        mockMvc.perform(post("/api/v1/inspectors")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Duplicate attempt (different casing)
        CreateInspectorRequest duplicateRequest = new CreateInspectorRequest(
                "DUPLICATE@sih.gov.in",
                "AnotherPassword@123"
        );

        mockMvc.perform(post("/api/v1/inspectors")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.message", containsString("User already exists with email")));
    }

    @Test
    @DisplayName("Test 7: Role escalation attempt is rejected or ignored without creating an ADMIN")
    void createInspector_RoleEscalationAttempt_DoesNotCreateAdmin() throws Exception {
        // Client sends payload containing extra "role": "ADMIN"
        String rawJson = "{\"email\":\"malicious@sih.gov.in\",\"password\":\"TestPassword@123\",\"role\":\"ADMIN\"}";

        mockMvc.perform(post("/api/v1/inspectors")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(rawJson))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    // May return 400 (if Jackson rejects unknown property) or 201 (if ignored)
                    assertTrue(status == 400 || status == 201, "Expected 400 Bad Request or 201 Created, got " + status);
                });

        // Crucial invariant: Verify no user exists with email malicious@sih.gov.in and role ADMIN
        Optional<User> maliciousUser = userRepository.findByEmailIgnoreCase("malicious@sih.gov.in");
        if (maliciousUser.isPresent()) {
            assertEquals(Role.INSPECTOR, maliciousUser.get().getRole(), "Created account must ALWAYS have Role.INSPECTOR");
            assertNotEquals(Role.ADMIN, maliciousUser.get().getRole());
        }

        assertEquals(1, userRepository.countByRole(Role.ADMIN), "Total ADMIN count in system must remain exactly 1");
    }

    @Test
    @DisplayName("Test 8: Password hashing validation (BCrypt encoded, plaintext not stored)")
    void createInspector_PasswordHashing_MatchesEncoder() throws Exception {
        CreateInspectorRequest request = new CreateInspectorRequest(
                "hashing-test@sih.gov.in",
                "UniquePassword@999"
        );

        mockMvc.perform(post("/api/v1/inspectors")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        User user = userRepository.findByEmailIgnoreCase("hashing-test@sih.gov.in").orElseThrow();
        assertNotEquals("UniquePassword@999", user.getPassword());
        assertTrue(passwordEncoder.matches("UniquePassword@999", user.getPassword()));
    }

    @Test
    @DisplayName("Test 9: Newly created inspector can be assigned to an institute via Phase 3 assignment module")
    void createInspector_ThenAssignToInstitute_Success() throws Exception {
        // Step 1: Create inspector
        CreateInspectorRequest createRequest = new CreateInspectorRequest(
                "new-assignable-inspector@sih.gov.in",
                "AssignPassword@123"
        );

        MvcResult result = mockMvc.perform(post("/api/v1/inspectors")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        ApiResponse<?> responseObj = objectMapper.readValue(result.getResponse().getContentAsString(), ApiResponse.class);
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) responseObj.data();
        Long newInspectorId = ((Number) data.get("id")).longValue();

        // Step 2: Assign newly created inspector to sample institute using existing assignment endpoint
        CreateAssignmentRequest assignRequest = new CreateAssignmentRequest(newInspectorId, sampleInstitute.getId());

        mockMvc.perform(post("/api/inspector-assignments")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.inspector.email", is("new-assignable-inspector@sih.gov.in")))
                .andExpect(jsonPath("$.data.institute.code", is("DIT001")))
                .andExpect(jsonPath("$.data.status", is("ACTIVE")));
    }

    @Test
    @DisplayName("Test 10: Single ADMIN invariant is maintained after creating inspectors")
    void createInspector_MaintainsSingleAdminInvariant() throws Exception {
        long initialAdminCount = userRepository.countByRole(Role.ADMIN);
        assertEquals(1, initialAdminCount);

        CreateInspectorRequest request = new CreateInspectorRequest(
                "inspector-invariant@sih.gov.in",
                "TestPassword@123"
        );

        mockMvc.perform(post("/api/v1/inspectors")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        long finalAdminCount = userRepository.countByRole(Role.ADMIN);
        assertEquals(1, finalAdminCount, "ADMIN count must strictly remain 1");
    }

    @Test
    @DisplayName("Test 11: ADMIN can list all inspectors (200 OK)")
    void getAllInspectors_ByAdmin_Returns200() throws Exception {
        mockMvc.perform(get("/api/v1/inspectors")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[0].role", is("INSPECTOR")));
    }

    @Test
    @DisplayName("Test 12: INSPECTOR and INSTITUTE roles cannot list inspectors (403 Forbidden)")
    void getAllInspectors_ByNonAdmin_Returns403() throws Exception {
        mockMvc.perform(get("/api/v1/inspectors")
                        .header("Authorization", inspectorToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/inspectors")
                        .header("Authorization", instituteToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Test 13: ADMIN can retrieve inspector by ID (200 OK)")
    void getInspectorById_ByAdmin_Returns200() throws Exception {
        mockMvc.perform(get("/api/v1/inspectors/" + existingInspector.getId())
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(existingInspector.getId().intValue())))
                .andExpect(jsonPath("$.data.email", is("inspector@sih.gov.in")))
                .andExpect(jsonPath("$.data.role", is("INSPECTOR")));
    }

    @Test
    @DisplayName("Test 14: Non-existent inspector ID returns 404 Not Found")
    void getInspectorById_NotFound_Returns404() throws Exception {
        mockMvc.perform(get("/api/v1/inspectors/99999")
                        .header("Authorization", adminToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")));
    }

    @Test
    @DisplayName("Test 15: Validation errors on blank email, invalid email format, and blank/short password")
    void createInspector_ValidationErrors_Returns400() throws Exception {
        // Blank email
        mockMvc.perform(post("/api/v1/inspectors")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateInspectorRequest("", "Password@123"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Validation Failed")));

        // Invalid email format
        mockMvc.perform(post("/api/v1/inspectors")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateInspectorRequest("not-an-email", "Password@123"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Validation Failed")));

        // Blank password
        mockMvc.perform(post("/api/v1/inspectors")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateInspectorRequest("valid@sih.gov.in", ""))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Validation Failed")));

        // Password too short (< 8 characters)
        mockMvc.perform(post("/api/v1/inspectors")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateInspectorRequest("valid@sih.gov.in", "short"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Validation Failed")));
    }
}
