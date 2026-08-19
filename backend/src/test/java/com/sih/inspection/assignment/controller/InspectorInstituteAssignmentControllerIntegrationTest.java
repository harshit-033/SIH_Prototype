package com.sih.inspection.assignment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.inspection.assignment.dto.CreateAssignmentRequest;
import com.sih.inspection.assignment.entity.AssignmentStatus;
import com.sih.inspection.assignment.entity.InspectorInstituteAssignment;
import com.sih.inspection.assignment.repository.InspectorInstituteAssignmentRepository;
import com.sih.inspection.auth.entity.AccountStatus;
import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.auth.entity.User;
import com.sih.inspection.auth.repository.UserRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("local")
class InspectorInstituteAssignmentControllerIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InstituteRepository instituteRepository;

    @Autowired
    private InspectorInstituteAssignmentRepository assignmentRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    private String adminToken;
    private String inspectorToken;
    private String inspector2Token;
    private String instituteToken;

    private User inspector1;
    private User inspector2;
    private Institute institute1;
    private Institute institute2;
    private InspectorInstituteAssignment savedAssignment;

    @Autowired
    private com.sih.inspection.inspection.repository.InspectionAuditEventRepository auditEventRepository;

    @Autowired
    private com.sih.inspection.inspection.repository.InspectionResultRepository resultRepository;

    @Autowired
    private com.sih.inspection.inspection.repository.InspectionRepository inspectionRepository;

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
        User admin = userRepository.save(new User(
                "admin@sih.gov.in",
                passwordEncoder.encode("Password@123"),
                Role.ADMIN,
                AccountStatus.ACTIVE
        ));
        adminToken = "Bearer " + jwtService.generateToken(admin.getId(), admin.getEmail(), admin.getRole(), admin.getStatus());

        // 2. Seed Inspector 1
        inspector1 = userRepository.save(new User(
                "inspector1@sih.gov.in",
                passwordEncoder.encode("Password@123"),
                Role.INSPECTOR,
                AccountStatus.ACTIVE
        ));
        inspectorToken = "Bearer " + jwtService.generateToken(inspector1.getId(), inspector1.getEmail(), inspector1.getRole(), inspector1.getStatus());

        // 3. Seed Inspector 2
        inspector2 = userRepository.save(new User(
                "inspector2@sih.gov.in",
                passwordEncoder.encode("Password@123"),
                Role.INSPECTOR,
                AccountStatus.ACTIVE
        ));
        inspector2Token = "Bearer " + jwtService.generateToken(inspector2.getId(), inspector2.getEmail(), inspector2.getRole(), inspector2.getStatus());

        // 4. Seed Institute User
        User instituteUser = userRepository.save(new User(
                "institute@sih.gov.in",
                passwordEncoder.encode("Password@123"),
                Role.INSTITUTE,
                AccountStatus.ACTIVE
        ));
        instituteToken = "Bearer " + jwtService.generateToken(instituteUser.getId(), instituteUser.getEmail(), instituteUser.getRole(), instituteUser.getStatus());

        // 5. Seed Institutes
        institute1 = instituteRepository.save(new Institute(
                "Delhi Institute of Technology", "DIT001", "Dwarka, Delhi", "North", "Delhi", "Delhi", "dit@dit.edu", "9876543210", InstituteStatus.ACTIVE
        ));
        institute2 = instituteRepository.save(new Institute(
                "Mumbai Engineering College", "MEC001", "Powai, Mumbai", "West", "Mumbai", "MH", "mec@mec.edu", "9876543210", InstituteStatus.ACTIVE
        ));

        // 6. Seed initial assignment: inspector1 -> institute1
        savedAssignment = assignmentRepository.save(new InspectorInstituteAssignment(inspector1, institute1));
    }

    @Test
    @DisplayName("ADMIN can assign inspector to institute and return 201 Created")
    void createAssignment_ByAdmin_Returns201() throws Exception {
        CreateAssignmentRequest request = new CreateAssignmentRequest(inspector1.getId(), institute2.getId());

        mockMvc.perform(post("/api/inspector-assignments")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", notNullValue()))
                .andExpect(jsonPath("$.data.inspector.email", is("inspector1@sih.gov.in")))
                .andExpect(jsonPath("$.data.institute.code", is("MEC001")))
                .andExpect(jsonPath("$.data.status", is("ACTIVE")));
    }

    @Test
    @DisplayName("Assigning second inspector to an already-assigned institute should return 409 Conflict")
    void createAssignment_DuplicateActiveInspectorOnInstitute_Returns409() throws Exception {
        // institute1 already has inspector1 assigned
        CreateAssignmentRequest duplicateRequest = new CreateAssignmentRequest(inspector2.getId(), institute1.getId());

        mockMvc.perform(post("/api/inspector-assignments")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.message", containsString("already has an active inspector assigned")));
    }

    @Test
    @DisplayName("INSPECTOR role cannot create assignments (403 Forbidden)")
    void createAssignment_ByInspector_Returns403() throws Exception {
        CreateAssignmentRequest request = new CreateAssignmentRequest(inspector1.getId(), institute2.getId());

        mockMvc.perform(post("/api/inspector-assignments")
                        .header("Authorization", inspectorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    @DisplayName("INSTITUTE role cannot create assignments (403 Forbidden)")
    void createAssignment_ByInstitute_Returns403() throws Exception {
        CreateAssignmentRequest request = new CreateAssignmentRequest(inspector1.getId(), institute2.getId());

        mockMvc.perform(post("/api/inspector-assignments")
                        .header("Authorization", instituteToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated request cannot create assignment (401 Unauthorized)")
    void createAssignment_Unauthenticated_Returns401() throws Exception {
        CreateAssignmentRequest request = new CreateAssignmentRequest(inspector1.getId(), institute2.getId());

        mockMvc.perform(post("/api/inspector-assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("ADMIN can list all assignments (200 OK)")
    void getAllAssignments_ByAdmin_Returns200() throws Exception {
        mockMvc.perform(get("/api/inspector-assignments")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].inspectorEmail", is("inspector1@sih.gov.in")));
    }

    @Test
    @DisplayName("INSPECTOR cannot list all assignments (403 Forbidden)")
    void getAllAssignments_ByInspector_Returns403() throws Exception {
        mockMvc.perform(get("/api/inspector-assignments")
                        .header("Authorization", inspectorToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("INSPECTOR can retrieve only their own assigned institutes via /my (200 OK)")
    void getMyAssignments_ByInspector_Returns200() throws Exception {
        mockMvc.perform(get("/api/inspector-assignments/my")
                        .header("Authorization", inspectorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].instituteCode", is("DIT001")));
    }

    @Test
    @DisplayName("INSPECTOR 2 with no assignments receives empty list via /my (200 OK)")
    void getMyAssignments_Inspector2_ReturnsEmptyList() throws Exception {
        mockMvc.perform(get("/api/inspector-assignments/my")
                        .header("Authorization", inspector2Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    @DisplayName("ADMIN can retrieve active inspector for an institute (200 OK)")
    void getInstituteInspector_ByAdmin_Returns200() throws Exception {
        mockMvc.perform(get("/api/institutes/" + institute1.getId() + "/inspector")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is("inspector1@sih.gov.in")));
    }

    @Test
    @DisplayName("ADMIN can deactivate an assignment (200 OK)")
    void deactivateAssignment_ByAdmin_Returns200() throws Exception {
        mockMvc.perform(delete("/api/inspector-assignments/" + savedAssignment.getId())
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("INACTIVE")))
                .andExpect(jsonPath("$.data.deactivatedAt", notNullValue()));
    }

    @Test
    @DisplayName("After deactivating existing assignment, a new inspector can be assigned to the institute")
    void reassignInspectorAfterDeactivation_Success() throws Exception {
        // 1. Deactivate inspector1 assignment
        mockMvc.perform(delete("/api/inspector-assignments/" + savedAssignment.getId())
                        .header("Authorization", adminToken))
                .andExpect(status().isOk());

        // 2. Assign inspector2 to institute1
        CreateAssignmentRequest newRequest = new CreateAssignmentRequest(inspector2.getId(), institute1.getId());

        mockMvc.perform(post("/api/inspector-assignments")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.inspector.email", is("inspector2@sih.gov.in")))
                .andExpect(jsonPath("$.data.institute.code", is("DIT001")));
    }
}
