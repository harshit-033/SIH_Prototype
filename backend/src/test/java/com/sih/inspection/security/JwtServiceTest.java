package com.sih.inspection.security;

import com.sih.inspection.auth.entity.AccountStatus;
import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.auth.entity.User;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Date;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private JwtProperties jwtProperties;

    @BeforeEach
    void setUp() {
        jwtProperties = new JwtProperties();
        jwtProperties.setSecretKey("404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        jwtProperties.setExpiration(3600000L); // 1 hour
        jwtService = new JwtService(jwtProperties);
    }

    @Test
    @DisplayName("Should generate token with required claims and extract subject correctly")
    void generateToken_ShouldContainSubjectAndClaims() {
        User user = new User(1L, "inspector@sih.gov.in", "hashed_pass", Role.INSPECTOR, AccountStatus.ACTIVE, null, null);
        SecurityUser securityUser = new SecurityUser(user);

        String token = jwtService.generateToken(securityUser);

        assertNotNull(token);
        assertFalse(token.isBlank());
        assertEquals("inspector@sih.gov.in", jwtService.extractUsername(token));
        assertEquals(1L, jwtService.extractUserId(token));
        assertEquals("INSPECTOR", jwtService.extractRole(token));
        assertEquals("ACTIVE", jwtService.extractStatus(token));
        assertFalse(jwtService.isTokenExpired(token));
    }

    @Test
    @DisplayName("Should validate valid token against user details")
    void isTokenValid_WithMatchingUser_ShouldReturnTrue() {
        User user = new User(2L, "admin@sih.gov.in", "hashed_pass", Role.ADMIN, AccountStatus.ACTIVE, null, null);
        SecurityUser securityUser = new SecurityUser(user);

        String token = jwtService.generateToken(securityUser);

        assertTrue(jwtService.isTokenValid(token, securityUser));
    }

    @Test
    @DisplayName("Should invalidate token for different user email")
    void isTokenValid_WithDifferentUser_ShouldReturnFalse() {
        User user1 = new User(1L, "user1@sih.gov.in", "pass", Role.INSPECTOR, AccountStatus.ACTIVE, null, null);
        User user2 = new User(2L, "user2@sih.gov.in", "pass", Role.INSPECTOR, AccountStatus.ACTIVE, null, null);

        String token = jwtService.generateToken(new SecurityUser(user1));

        assertFalse(jwtService.isTokenValid(token, new SecurityUser(user2)));
    }

    @Test
    @DisplayName("Should detect expired token")
    void isTokenExpired_WithExpiredToken_ShouldReturnTrue() {
        // Build token that expired 10 seconds ago
        String token = jwtService.buildToken(
                Map.of("userId", 1L, "role", "ADMIN"),
                "admin@sih.gov.in",
                -10000L
        );

        assertThrows(JwtException.class, () -> jwtService.extractUsername(token));
    }

    @Test
    @DisplayName("Should fail parsing on tampered token")
    void extractAllClaims_WithTamperedToken_ShouldThrowException() {
        String token = jwtService.generateToken(1L, "admin@sih.gov.in", Role.ADMIN, AccountStatus.ACTIVE);
        String tamperedToken = token + "corrupted";

        assertThrows(JwtException.class, () -> jwtService.extractAllClaims(tamperedToken));
    }
}
