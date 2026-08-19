package com.sih.inspection.institute.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.inspection.auth.entity.AccountStatus;
import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.auth.entity.User;
import com.sih.inspection.auth.repository.UserRepository;
import com.sih.inspection.institute.dto.CreateInstituteRequest;
import com.sih.inspection.institute.dto.UpdateInstituteRequest;
import com.sih.inspection.institute.entity.Institute;
import com.sih.inspection.institute.entity.InstituteStatus;
import com.sih.inspection.institute.repository.InstituteRepository;
import com.sih.inspection.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
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
class InstituteControllerIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InstituteRepository instituteRepository;

    @Autowired
    private com.sih.inspection.assignment.repository.InspectorInstituteAssignmentRepository assignmentRepository;

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

    private Institute savedInstitute;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();

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

        // 2. Seed Inspector
        User inspector = userRepository.save(new User(
                "inspector@sih.gov.in",
                passwordEncoder.encode("Password@123"),
                Role.INSPECTOR,
                AccountStatus.ACTIVE
        ));
        inspectorToken = "Bearer " + jwtService.generateToken(inspector.getId(), inspector.getEmail(), inspector.getRole(), inspector.getStatus());

        // 3. Seed Institute
        User instituteUser = userRepository.save(new User(
                "institute@sih.gov.in",
                passwordEncoder.encode("Password@123"),
                Role.INSTITUTE,
                AccountStatus.ACTIVE
        ));
        instituteToken = "Bearer " + jwtService.generateToken(instituteUser.getId(), instituteUser.getEmail(), instituteUser.getRole(), instituteUser.getStatus());

        // Seed an initial Institute record
        savedInstitute = instituteRepository.save(new Institute(
                "Delhi Institute of Technology",
                "DIT001",
                "Sector 12, Dwarka, New Delhi",
                "North",
                "New Delhi",
                "Delhi",
                "contact@dit.edu.in",
                "9876543210",
                InstituteStatus.ACTIVE
        ));
    }

    @Nested
    @DisplayName("POST /api/institutes (Create Institute)")
    class CreateInstituteTests {

        @Test
        @DisplayName("ADMIN role should create institute successfully and return 201 Created")
        void createInstitute_ByAdmin_Returns201() throws Exception {
            CreateInstituteRequest request = new CreateInstituteRequest(
                    "Mumbai Engineering College",
                    "MEC001",
                    "Powai, Mumbai",
                    "West",
                    "Mumbai",
                    "Maharashtra",
                    "info@mec.edu.in",
                    "9811223344",
                    InstituteStatus.ACTIVE
            );

            mockMvc.perform(post("/api/institutes")
                            .header("Authorization", adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.message", containsString("created successfully")))
                    .andExpect(jsonPath("$.data.id", notNullValue()))
                    .andExpect(jsonPath("$.data.name", is("Mumbai Engineering College")))
                    .andExpect(jsonPath("$.data.code", is("MEC001")))
                    .andExpect(jsonPath("$.data.status", is("ACTIVE")));
        }

        @Test
        @DisplayName("INSPECTOR role should be rejected with 403 Forbidden")
        void createInstitute_ByInspector_Returns403() throws Exception {
            CreateInstituteRequest request = new CreateInstituteRequest(
                    "Pune Tech Institute", "PTI001", "Shivaji Nagar", "West", "Pune", "MH", "pune@pti.edu.in", "9876543210", InstituteStatus.ACTIVE
            );

            mockMvc.perform(post("/api/institutes")
                            .header("Authorization", inspectorToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.status", is(403)));
        }

        @Test
        @DisplayName("INSTITUTE role should be rejected with 403 Forbidden")
        void createInstitute_ByInstitute_Returns403() throws Exception {
            CreateInstituteRequest request = new CreateInstituteRequest(
                    "Pune Tech Institute", "PTI001", "Shivaji Nagar", "West", "Pune", "MH", "pune@pti.edu.in", "9876543210", InstituteStatus.ACTIVE
            );

            mockMvc.perform(post("/api/institutes")
                            .header("Authorization", instituteToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.status", is(403)));
        }

        @Test
        @DisplayName("Unauthenticated request should return 401 Unauthorized")
        void createInstitute_Unauthenticated_Returns401() throws Exception {
            CreateInstituteRequest request = new CreateInstituteRequest(
                    "Pune Tech Institute", "PTI001", "Shivaji Nagar", "West", "Pune", "MH", "pune@pti.edu.in", "9876543210", InstituteStatus.ACTIVE
            );

            mockMvc.perform(post("/api/institutes")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status", is(401)));
        }

        @Test
        @DisplayName("Duplicate institute code should return 409 Conflict")
        void createInstitute_DuplicateCode_Returns409() throws Exception {
            CreateInstituteRequest duplicateRequest = new CreateInstituteRequest(
                    "Duplicate Institute",
                    "DIT001", // Already exists
                    "Address",
                    "North",
                    "Delhi",
                    "Delhi",
                    "unique@dit.edu.in",
                    "9876543210",
                    InstituteStatus.ACTIVE
            );

            mockMvc.perform(post("/api/institutes")
                            .header("Authorization", adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(duplicateRequest)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.status", is(409)))
                    .andExpect(jsonPath("$.message", containsString("DIT001")));
        }

        @Test
        @DisplayName("Blank required fields should return 400 Bad Request with field violations")
        void createInstitute_BlankFields_Returns400() throws Exception {
            CreateInstituteRequest invalidRequest = new CreateInstituteRequest(
                    "", "", "", "", "", "", "not-an-email", "123", null
            );

            mockMvc.perform(post("/api/institutes")
                            .header("Authorization", adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status", is(400)))
                    .andExpect(jsonPath("$.errors", hasSize(greaterThan(0))));
        }
    }

    @Nested
    @DisplayName("GET /api/institutes (Get All Institutes)")
    class GetAllInstitutesTests {

        @Test
        @DisplayName("ADMIN role should retrieve all institutes and return 200 OK")
        void getAllInstitutes_ByAdmin_Returns200() throws Exception {
            mockMvc.perform(get("/api/institutes")
                            .header("Authorization", adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].code", is("DIT001")));
        }

        @Test
        @DisplayName("INSPECTOR role should retrieve all institutes and return 200 OK")
        void getAllInstitutes_ByInspector_Returns200() throws Exception {
            mockMvc.perform(get("/api/institutes")
                            .header("Authorization", inspectorToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].code", is("DIT001")));
        }

        @Test
        @DisplayName("INSTITUTE role should be rejected with 403 Forbidden")
        void getAllInstitutes_ByInstitute_Returns403() throws Exception {
            mockMvc.perform(get("/api/institutes")
                            .header("Authorization", instituteToken))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.status", is(403)));
        }

        @Test
        @DisplayName("Unauthenticated request should return 401 Unauthorized")
        void getAllInstitutes_Unauthenticated_Returns401() throws Exception {
            mockMvc.perform(get("/api/institutes"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status", is(401)));
        }
    }

    @Nested
    @DisplayName("GET /api/institutes/{id} (Get Institute By ID)")
    class GetInstituteByIdTests {

        @Test
        @DisplayName("ADMIN role should retrieve institute by ID and return 200 OK")
        void getInstituteById_ByAdmin_Returns200() throws Exception {
            mockMvc.perform(get("/api/institutes/" + savedInstitute.getId())
                            .header("Authorization", adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.id", is(savedInstitute.getId().intValue())))
                    .andExpect(jsonPath("$.data.code", is("DIT001")));
        }

        @Test
        @DisplayName("INSPECTOR role should retrieve institute by ID and return 200 OK")
        void getInstituteById_ByInspector_Returns200() throws Exception {
            mockMvc.perform(get("/api/institutes/" + savedInstitute.getId())
                            .header("Authorization", inspectorToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.code", is("DIT001")));
        }

        @Test
        @DisplayName("INSTITUTE role should be rejected with 403 Forbidden")
        void getInstituteById_ByInstitute_Returns403() throws Exception {
            mockMvc.perform(get("/api/institutes/" + savedInstitute.getId())
                            .header("Authorization", instituteToken))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Non-existent institute ID should return 404 Not Found")
        void getInstituteById_NotFound_Returns404() throws Exception {
            mockMvc.perform(get("/api/institutes/99999")
                            .header("Authorization", adminToken))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status", is(404)))
                    .andExpect(jsonPath("$.message", containsString("99999")));
        }
    }

    @Nested
    @DisplayName("PUT /api/institutes/{id} (Update Institute)")
    class UpdateInstituteTests {

        @Test
        @DisplayName("ADMIN role should update institute and return 200 OK")
        void updateInstitute_ByAdmin_Returns200() throws Exception {
            UpdateInstituteRequest updateRequest = new UpdateInstituteRequest(
                    "Delhi Technological University",
                    "DTU001",
                    "Bawana Road, Shahbad Daulatpur, Delhi",
                    "North",
                    "Delhi",
                    "Delhi",
                    "registrar@dtu.ac.in",
                    "9876543210",
                    InstituteStatus.ACTIVE
            );

            mockMvc.perform(put("/api/institutes/" + savedInstitute.getId())
                            .header("Authorization", adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.name", is("Delhi Technological University")))
                    .andExpect(jsonPath("$.data.code", is("DTU001")));
        }

        @Test
        @DisplayName("INSPECTOR role should be rejected with 403 Forbidden")
        void updateInstitute_ByInspector_Returns403() throws Exception {
            UpdateInstituteRequest updateRequest = new UpdateInstituteRequest(
                    "DTU", "DTU001", "Addr", "North", "Delhi", "Delhi", "reg@dtu.ac.in", "9876543210", InstituteStatus.ACTIVE
            );

            mockMvc.perform(put("/api/institutes/" + savedInstitute.getId())
                            .header("Authorization", inspectorToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("INSTITUTE role should be rejected with 403 Forbidden")
        void updateInstitute_ByInstitute_Returns403() throws Exception {
            UpdateInstituteRequest updateRequest = new UpdateInstituteRequest(
                    "DTU", "DTU001", "Addr", "North", "Delhi", "Delhi", "reg@dtu.ac.in", "9876543210", InstituteStatus.ACTIVE
            );

            mockMvc.perform(put("/api/institutes/" + savedInstitute.getId())
                            .header("Authorization", instituteToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Non-existent institute ID should return 404 Not Found")
        void updateInstitute_NotFound_Returns404() throws Exception {
            UpdateInstituteRequest updateRequest = new UpdateInstituteRequest(
                    "DTU", "DTU001", "Addr", "North", "Delhi", "Delhi", "reg@dtu.ac.in", "9876543210", InstituteStatus.ACTIVE
            );

            mockMvc.perform(put("/api/institutes/99999")
                            .header("Authorization", adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status", is(404)));
        }
    }
}
