package com.sih.inspection.inspection.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.inspection.auth.entity.AccountStatus;
import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.auth.entity.User;
import com.sih.inspection.auth.repository.UserRepository;
import com.sih.inspection.inspection.dto.CreateInspectionRequest;
import com.sih.inspection.inspection.dto.MLInspectionResultRequest;
import com.sih.inspection.inspection.entity.Inspection;
import com.sih.inspection.inspection.enums.InspectionStatus;
import com.sih.inspection.inspection.enums.InspectionType;
import com.sih.inspection.inspection.repository.InspectionAuditEventRepository;
import com.sih.inspection.inspection.repository.InspectionRepository;
import com.sih.inspection.inspection.repository.InspectionResultRepository;
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
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("local")
class InspectionControllerIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InstituteRepository instituteRepository;

    @Autowired
    private com.sih.inspection.assignment.repository.InspectorInstituteAssignmentRepository assignmentRepository;

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
    private String instituteTokenA;
    private String instituteTokenB;
    private String mlServiceToken;

    private Institute instituteA;
    private Institute instituteB;

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
        User admin = new User("admin@sih.gov.in", passwordEncoder.encode("SecretPass123!"), Role.ADMIN, AccountStatus.ACTIVE);
        userRepository.save(admin);
        adminToken = "Bearer " + jwtService.generateToken(new com.sih.inspection.security.SecurityUser(admin));

        // 2. Seed Inspector
        User inspector = new User("inspector@sih.gov.in", passwordEncoder.encode("SecretPass123!"), Role.INSPECTOR, AccountStatus.ACTIVE);
        userRepository.save(inspector);
        inspectorToken = "Bearer " + jwtService.generateToken(new com.sih.inspection.security.SecurityUser(inspector));

        // 3. Seed Institute User A
        User instituteUserA = new User("institute_a@sih.gov.in", passwordEncoder.encode("SecretPass123!"), Role.INSTITUTE, AccountStatus.ACTIVE);
        userRepository.save(instituteUserA);
        instituteTokenA = "Bearer " + jwtService.generateToken(new com.sih.inspection.security.SecurityUser(instituteUserA));

        // 4. Seed Institute User B
        User instituteUserB = new User("institute_b@sih.gov.in", passwordEncoder.encode("SecretPass123!"), Role.INSTITUTE, AccountStatus.ACTIVE);
        userRepository.save(instituteUserB);
        instituteTokenB = "Bearer " + jwtService.generateToken(new com.sih.inspection.security.SecurityUser(instituteUserB));

        // 5. Seed ML Service Machine User
        User mlServiceUser = new User("ml_service@sih.gov.in", passwordEncoder.encode("SecretPass123!"), Role.ML_SERVICE, AccountStatus.ACTIVE);
        userRepository.save(mlServiceUser);
        mlServiceToken = "Bearer " + jwtService.generateToken(new com.sih.inspection.security.SecurityUser(mlServiceUser));

        // 6. Seed Institute A
        instituteA = new Institute("Delhi Engineering College", "DEC001", "North Campus", "North", "Delhi", "Delhi", "institute_a@sih.gov.in", "9876543210", InstituteStatus.ACTIVE);
        instituteA = instituteRepository.save(instituteA);

        // 7. Seed Institute B
        instituteB = new Institute("Mumbai Institute of Technology", "MIT001", "Worli", "West", "Mumbai", "Maharashtra", "institute_b@sih.gov.in", "9876543222", InstituteStatus.ACTIVE);
        instituteB = instituteRepository.save(instituteB);
    }

    @Test
    @DisplayName("Institute user can successfully request a new inspection")
    void createInspection_Success_AsInstitute() throws Exception {
        CreateInspectionRequest request = new CreateInspectionRequest(InspectionType.FULL_INSPECTION);

        mockMvc.perform(post("/api/v1/inspections")
                        .header("Authorization", instituteTokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.inspectionNumber", startsWith("INS-")))
                .andExpect(jsonPath("$.data.status").value("REQUESTED"))
                .andExpect(jsonPath("$.data.institute.code").value("DEC001"));
    }

    @Test
    @DisplayName("Admin can create inspection specifying instituteId")
    void createInspection_Success_AsAdmin() throws Exception {
        CreateInspectionRequest request = new CreateInspectionRequest(InspectionType.FULL_INSPECTION, instituteB.getId());

        mockMvc.perform(post("/api/v1/inspections")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.institute.code").value("MIT001"));
    }

    @Test
    @DisplayName("Inspector role cannot create an inspection (403 Forbidden)")
    void createInspection_Forbidden_AsInspector() throws Exception {
        CreateInspectionRequest request = new CreateInspectionRequest(InspectionType.FULL_INSPECTION);

        mockMvc.perform(post("/api/v1/inspections")
                        .header("Authorization", inspectorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Full lifecycle: Create -> Start -> Submit ML Result -> Retrieve Result")
    void fullInspectionWorkflow_Success() throws Exception {
        // Step 1: Create Inspection as Institute A
        CreateInspectionRequest createReq = new CreateInspectionRequest(InspectionType.FULL_INSPECTION);
        String createResponse = mockMvc.perform(post("/api/v1/inspections")
                        .header("Authorization", instituteTokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String inspectionIdStr = objectMapper.readTree(createResponse).path("data").path("id").asText();
        UUID inspectionId = UUID.fromString(inspectionIdStr);

        // Step 2: Start Inspection (REQUESTED -> PROCESSING)
        mockMvc.perform(post("/api/v1/inspections/" + inspectionId + "/start")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PROCESSING"))
                .andExpect(jsonPath("$.data.startedAt").isNotEmpty());

        // Step 3: ML Service submits combined ML inspection result
        MLInspectionResultRequest mlResult = new MLInspectionResultRequest(
                Map.of("score", 84.0, "detectedGarbageItems", 3),
                Map.of("score", 91.5, "infrastructureCondition", "GOOD"),
                Map.of("score", 95.0, "activeComputers", 48, "totalComputers", 50),
                90.2,
                "1.0.0"
        );

        mockMvc.perform(post("/api/v1/inspections/" + inspectionId + "/results")
                        .header("Authorization", mlServiceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mlResult)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.finalScore").value(90.2))
                .andExpect(jsonPath("$.data.modelVersion").value("1.0.0"))
                .andExpect(jsonPath("$.data.garbageDetection.detectedGarbageItems").value(3))
                .andExpect(jsonPath("$.data.computerConnectivity.activeComputers").value(48));

        // Step 4: Retrieve Inspection Details -> Should now be COMPLETED
        mockMvc.perform(get("/api/v1/inspections/" + inspectionId)
                        .header("Authorization", instituteTokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.hasResult").value(true))
                .andExpect(jsonPath("$.data.finalScore").value(90.2));

        // Step 5: Retrieve Result via /results endpoint
        mockMvc.perform(get("/api/v1/inspections/" + inspectionId + "/results")
                        .header("Authorization", instituteTokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.finalScore").value(90.2))
                .andExpect(jsonPath("$.data.infrastructureCheckup.infrastructureCondition").value("GOOD"));
    }

    @Test
    @DisplayName("Institute user cannot submit ML results directly (403 Forbidden)")
    void submitMLResult_Forbidden_AsInstitute() throws Exception {
        Inspection inspection = new Inspection("INS-2026-000099", instituteA, InspectionType.FULL_INSPECTION);
        inspection.start();
        inspection = inspectionRepository.save(inspection);

        MLInspectionResultRequest mlResult = new MLInspectionResultRequest(null, null, null, 88.0, "1.0.0");

        mockMvc.perform(post("/api/v1/inspections/" + inspection.getId() + "/results")
                        .header("Authorization", instituteTokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mlResult)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Duplicate ML result submission returns 409 Conflict")
    void submitMLResult_Conflict_WhenDuplicate() throws Exception {
        Inspection inspection = new Inspection("INS-2026-000088", instituteA, InspectionType.FULL_INSPECTION);
        inspection.start();
        inspection = inspectionRepository.save(inspection);

        MLInspectionResultRequest mlResult = new MLInspectionResultRequest(null, null, null, 88.0, "1.0.0");

        // First submission succeeds
        mockMvc.perform(post("/api/v1/inspections/" + inspection.getId() + "/results")
                        .header("Authorization", mlServiceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mlResult)))
                .andExpect(status().isOk());

        // Second submission is rejected with 409 Conflict
        mockMvc.perform(post("/api/v1/inspections/" + inspection.getId() + "/results")
                        .header("Authorization", mlServiceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mlResult)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(containsString("already has a finalized result")));
    }

    @Test
    @DisplayName("Institute B cannot view Institute A's inspection (403 Forbidden)")
    void getInspectionById_Forbidden_WhenOtherInstitute() throws Exception {
        Inspection inspection = new Inspection("INS-2026-000077", instituteA, InspectionType.FULL_INSPECTION);
        inspection = inspectionRepository.save(inspection);

        mockMvc.perform(get("/api/v1/inspections/" + inspection.getId())
                        .header("Authorization", instituteTokenB))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Institute listings only return inspections belonging to that institute")
    void listInspections_DataIsolation_AsInstitute() throws Exception {
        Inspection insA = new Inspection("INS-2026-000001", instituteA, InspectionType.FULL_INSPECTION);
        Inspection insB = new Inspection("INS-2026-000002", instituteB, InspectionType.FULL_INSPECTION);
        inspectionRepository.save(insA);
        inspectionRepository.save(insB);

        mockMvc.perform(get("/api/v1/inspections")
                        .header("Authorization", instituteTokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].institute.code").value("DEC001"));
    }

    @Test
    @DisplayName("Cancel requested inspection successfully")
    void cancelInspection_Success() throws Exception {
        Inspection inspection = new Inspection("INS-2026-000066", instituteA, InspectionType.FULL_INSPECTION);
        inspection = inspectionRepository.save(inspection);

        mockMvc.perform(post("/api/v1/inspections/" + inspection.getId() + "/cancel")
                        .header("Authorization", instituteTokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("reason", "Rescheduled"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"))
                .andExpect(jsonPath("$.data.failureReason").value("Rescheduled"));
    }

    @Test
    @DisplayName("Unauthenticated request returns 401 Unauthorized")
    void unauthenticatedRequest_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/inspections"))
                .andExpect(status().isUnauthorized());
    }
}
