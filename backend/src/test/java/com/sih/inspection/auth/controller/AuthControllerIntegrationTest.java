package com.sih.inspection.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.inspection.auth.dto.LoginRequest;
import com.sih.inspection.auth.entity.AccountStatus;
import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.auth.entity.User;
import com.sih.inspection.auth.repository.UserRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("local")
class AuthControllerIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.sih.inspection.assignment.repository.InspectorInstituteAssignmentRepository assignmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        assignmentRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Seed Active Admin
        User activeAdmin = new User();
        activeAdmin.setEmail("admin@sih.gov.in");
        activeAdmin.setPassword(passwordEncoder.encode("SecretPass123!"));
        activeAdmin.setRole(Role.ADMIN);
        activeAdmin.setStatus(AccountStatus.ACTIVE);
        userRepository.save(activeAdmin);

        // 2. Seed Active Inspector
        User activeInspector = new User();
        activeInspector.setEmail("inspector@sih.gov.in");
        activeInspector.setPassword(passwordEncoder.encode("InspectorPass123!"));
        activeInspector.setRole(Role.INSPECTOR);
        activeInspector.setStatus(AccountStatus.ACTIVE);
        userRepository.save(activeInspector);

        // 3. Seed Disabled User
        User disabledUser = new User();
        disabledUser.setEmail("disabled@sih.gov.in");
        disabledUser.setPassword(passwordEncoder.encode("DisabledPass123!"));
        disabledUser.setRole(Role.INSTITUTE);
        disabledUser.setStatus(AccountStatus.DISABLED);
        userRepository.save(disabledUser);
    }

    @Test
    @DisplayName("POST /api/auth/login - Success: Returns JWT token and user metadata for active account")
    void login_Success_ReturnsJwtAndUserMetadata() throws Exception {
        LoginRequest request = new LoginRequest("admin@sih.gov.in", "SecretPass123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.email").value("admin@sih.gov.in"))
                .andExpect(jsonPath("$.data.role").value("ADMIN"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.password").doesNotExist()); // Password must never be returned
    }

    @Test
    @DisplayName("POST /api/auth/login - Failure: Wrong password returns 401 without stack trace")
    void login_WrongPassword_Returns401() throws Exception {
        LoginRequest request = new LoginRequest("admin@sih.gov.in", "WrongPassword!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid email or password"))
                .andExpect(jsonPath("$.stackTrace").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/auth/login - Failure: Non-existent email returns generic 401 (prevent enumeration)")
    void login_NonExistentEmail_ReturnsGeneric401() throws Exception {
        LoginRequest request = new LoginRequest("nobody@sih.gov.in", "AnyPassword123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Failure: Disabled account returns 403 Forbidden")
    void login_DisabledAccount_Returns403() throws Exception {
        LoginRequest request = new LoginRequest("disabled@sih.gov.in", "DisabledPass123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Failure: Validation error on invalid email format")
    void login_InvalidEmailFormat_Returns400WithFieldViolation() throws Exception {
        LoginRequest request = new LoginRequest("not-an-email", "Password123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.errors", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.errors[0].field").value("email"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Failure: Validation error on blank password")
    void login_BlankPassword_Returns400WithFieldViolation() throws Exception {
        LoginRequest request = new LoginRequest("admin@sih.gov.in", "");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.errors[0].field").value("password"));
    }

    @Test
    @DisplayName("GET /api/auth/me - Failure: Missing JWT on protected endpoint returns 401")
    void getMe_WithoutToken_Returns401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("GET /api/auth/me - Failure: Invalid/malformed JWT on protected endpoint returns 401")
    void getMe_WithInvalidToken_Returns401() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer invalid.corrupted.token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("GET /api/auth/me - Failure: Expired JWT on protected endpoint returns 401")
    void getMe_WithExpiredToken_Returns401() throws Exception {
        String expiredToken = jwtService.buildToken(
                Map.of("userId", 1L, "role", "ADMIN"),
                "admin@sih.gov.in",
                -10000L // expired 10s ago
        );

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("GET /api/auth/me - Success: Valid JWT returns 200 OK with user profile")
    void getMe_WithValidToken_Returns200AndUserProfile() throws Exception {
        User user = userRepository.findByEmailIgnoreCase("inspector@sih.gov.in").orElseThrow();
        String validToken = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole(), user.getStatus());

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("inspector@sih.gov.in"))
                .andExpect(jsonPath("$.data.role").value("INSPECTOR"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("GET /actuator/health - Publicly accessible without JWT")
    void actuatorHealth_PubliclyAccessible() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }
}
