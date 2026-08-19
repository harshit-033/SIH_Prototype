package com.sih.inspection.auth.service;

import com.sih.inspection.auth.dto.LoginRequest;
import com.sih.inspection.auth.dto.LoginResponse;
import com.sih.inspection.auth.entity.AccountStatus;
import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.auth.entity.User;
import com.sih.inspection.auth.repository.UserRepository;
import com.sih.inspection.exception.AccountDisabledException;
import com.sih.inspection.exception.InvalidCredentialsException;
import com.sih.inspection.security.JwtService;
import com.sih.inspection.security.SecurityUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(authenticationManager, jwtService, userRepository, passwordEncoder);
    }

    @Test
    @DisplayName("Should authenticate active user and return valid LoginResponse with JWT")
    void login_WithValidCredentials_ShouldReturnLoginResponse() {
        User user = new User(1L, "admin@sih.gov.in", "encoded_password", Role.ADMIN, AccountStatus.ACTIVE, null, null);
        SecurityUser securityUser = new SecurityUser(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(securityUser, null, securityUser.getAuthorities());

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(jwtService.generateToken(1L, "admin@sih.gov.in", Role.ADMIN, AccountStatus.ACTIVE)).thenReturn("mock.jwt.token");
        when(jwtService.getExpirationTime()).thenReturn(86400000L);

        LoginRequest request = new LoginRequest("admin@sih.gov.in", "Password123!");
        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.token());
        assertEquals("Bearer", response.tokenType());
        assertEquals(86400000L, response.expiresIn());
        assertEquals(1L, response.userId());
        assertEquals("admin@sih.gov.in", response.email());
        assertEquals(Role.ADMIN, response.role());
        assertEquals(AccountStatus.ACTIVE, response.status());
    }

    @Test
    @DisplayName("Should throw InvalidCredentialsException when bad password is provided")
    void login_WithInvalidPassword_ShouldThrowInvalidCredentialsException() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        LoginRequest request = new LoginRequest("admin@sih.gov.in", "WrongPassword");

        InvalidCredentialsException ex = assertThrows(
                InvalidCredentialsException.class,
                () -> authService.login(request)
        );

        assertEquals("Invalid email or password", ex.getMessage());
        verify(jwtService, never()).generateToken(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should throw AccountDisabledException when disabled account attempts login")
    void login_WithDisabledAccount_ShouldThrowAccountDisabledException() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new DisabledException("User is disabled"));

        LoginRequest request = new LoginRequest("disabled@sih.gov.in", "Password123!");

        AccountDisabledException ex = assertThrows(
                AccountDisabledException.class,
                () -> authService.login(request)
        );

        assertTrue(ex.getMessage().contains("disabled"));
        verify(jwtService, never()).generateToken(any(), any(), any(), any());
    }
}
