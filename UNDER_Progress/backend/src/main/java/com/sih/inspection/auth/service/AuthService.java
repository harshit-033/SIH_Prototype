package com.sih.inspection.auth.service;

import com.sih.inspection.auth.dto.LoginRequest;
import com.sih.inspection.auth.dto.LoginResponse;
import com.sih.inspection.auth.dto.UserSummaryResponse;
import com.sih.inspection.auth.entity.AccountStatus;
import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.auth.entity.User;
import com.sih.inspection.auth.repository.UserRepository;
import com.sih.inspection.exception.AccountDisabledException;
import com.sih.inspection.exception.DuplicateResourceException;
import com.sih.inspection.exception.InvalidCredentialsException;
import com.sih.inspection.security.JwtService;
import com.sih.inspection.security.SecurityUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service managing user authentication, credential validation, seed data, and JWT token issuance.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Authenticates a user against provided credentials and issues a signed JWT token.
     *
     * @param request the login request payload containing email and password
     * @return LoginResponse containing the issued token and user metadata
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        final String normalizedEmail = request.email().trim().toLowerCase();

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
            );

            SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
            User user = securityUser.getUser();

            if (user.getStatus() != AccountStatus.ACTIVE) {
                log.warn("Login attempt for non-active account: email=[{}], status=[{}]", normalizedEmail, user.getStatus());
                throw new AccountDisabledException("Account is " + user.getStatus().name().toLowerCase() + ". Please contact an administrator.");
            }

            String token = jwtService.generateToken(
                    user.getId(),
                    user.getEmail(),
                    user.getRole(),
                    user.getStatus()
            );

            log.info("Successful authentication for user: id=[{}], email=[{}], role=[{}]",
                    user.getId(), user.getEmail(), user.getRole());

            return LoginResponse.of(
                    token,
                    jwtService.getExpirationTime(),
                    user.getId(),
                    user.getEmail(),
                    user.getRole(),
                    user.getStatus()
            );

        } catch (BadCredentialsException | UsernameNotFoundException ex) {
            log.warn("Authentication failed for email=[{}]: invalid credentials", normalizedEmail);
            throw new InvalidCredentialsException("Invalid email or password");
        } catch (DisabledException | LockedException ex) {
            log.warn("Authentication failed for email=[{}]: {}", normalizedEmail, ex.getMessage());
            throw new AccountDisabledException("Account is disabled. Please contact an administrator.");
        }
    }

    /**
     * Retrieves summary profile for the currently authenticated user.
     */
    @Transactional(readOnly = true)
    public UserSummaryResponse getCurrentUserSummary(SecurityUser securityUser) {
        if (securityUser == null || securityUser.getUser() == null) {
            throw new InvalidCredentialsException("User authentication context is missing");
        }
        User user = userRepository.findById(securityUser.getId())
                .orElse(securityUser.getUser());
        return UserSummaryResponse.from(user);
    }

    /**
     * Enforces the critical system invariant: exactly ONE ADMIN account can exist in the system.
     * Throws DuplicateResourceException if an attempt is made to create or promote another user to ADMIN.
     *
     * @param user the user being saved or updated
     * @throws DuplicateResourceException if another ADMIN already exists
     */
    public void validateSingleAdminInvariant(User user) {
        if (user.getRole() == Role.ADMIN) {
            boolean anotherAdminExists = (user.getId() == null)
                    ? userRepository.existsByRole(Role.ADMIN)
                    : userRepository.existsByRoleAndIdNot(Role.ADMIN, user.getId());

            if (anotherAdminExists) {
                log.warn("Security violation: Attempted to create or promote secondary ADMIN account for email=[{}]", user.getEmail());
                throw new DuplicateResourceException("An administrator account already exists. Only one ADMIN is permitted in the system.");
            }
        }
    }

    /**
     * Seeds the standard demo user accounts if they do not already exist.
     * Idempotent: repeated calls do not create duplicate accounts or duplicate admins.
     */
    @Transactional
    public List<UserSummaryResponse> seedDefaultUsers() {
        String defaultPassword = "Password@123";
        String encodedPassword = passwordEncoder.encode(defaultPassword);

        List<User> seedUsers = List.of(
                new User("admin@sih.gov.in", encodedPassword, Role.ADMIN, AccountStatus.ACTIVE),
                new User("inspector@sih.gov.in", encodedPassword, Role.INSPECTOR, AccountStatus.ACTIVE),
                new User("institute@sih.gov.in", encodedPassword, Role.INSTITUTE, AccountStatus.ACTIVE),
                new User("disabled@sih.gov.in", encodedPassword, Role.INSTITUTE, AccountStatus.DISABLED)
        );

        List<UserSummaryResponse> created = new ArrayList<>();
        for (User u : seedUsers) {
            User targetUser = userRepository.findByEmailIgnoreCase(u.getEmail())
                    .map(existing -> {
                        existing.setPassword(encodedPassword);
                        existing.setRole(u.getRole());
                        existing.setStatus(u.getStatus());
                        validateSingleAdminInvariant(existing);
                        return userRepository.save(existing);
                    })
                    .orElseGet(() -> {
                        validateSingleAdminInvariant(u);
                        return userRepository.save(u);
                    });

            created.add(UserSummaryResponse.from(targetUser));
            log.info("Seeded/updated demo user: email=[{}], role=[{}], status=[{}]", targetUser.getEmail(), targetUser.getRole(), targetUser.getStatus());
        }
        return created;
    }
}
