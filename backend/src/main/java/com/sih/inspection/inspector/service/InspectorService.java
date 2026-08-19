package com.sih.inspection.inspector.service;

import com.sih.inspection.auth.entity.AccountStatus;
import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.auth.entity.User;
import com.sih.inspection.auth.repository.UserRepository;
import com.sih.inspection.exception.DuplicateResourceException;
import com.sih.inspection.exception.ResourceNotFoundException;
import com.sih.inspection.inspector.dto.CreateInspectorRequest;
import com.sih.inspection.inspector.dto.InspectorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service managing domain business logic for Inspector user provisioning and queries.
 * <p>
 * Enforces role security by unconditionally assigning {@link Role#INSPECTOR} and {@link AccountStatus#ACTIVE}
 * to newly provisioned inspector accounts.
 * </p>
 */
@Service
@Transactional(readOnly = true)
public class InspectorService {

    private static final Logger log = LoggerFactory.getLogger(InspectorService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public InspectorService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Provisions a new inspector user account.
     * <p>
     * Encodes password using configured {@link PasswordEncoder}, verifies email uniqueness,
     * and strictly assigns {@link Role#INSPECTOR} and {@link AccountStatus#ACTIVE}.
     * </p>
     *
     * @param request creation request containing email and raw password
     * @return InspectorResponse containing safe user metadata
     * @throws DuplicateResourceException if an account with this email already exists
     */
    @Transactional
    public InspectorResponse createInspector(CreateInspectorRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            log.warn("Failed to create inspector: email [{}] is already registered", normalizedEmail);
            throw new DuplicateResourceException("User already exists with email: " + normalizedEmail);
        }

        String encodedPassword = passwordEncoder.encode(request.password());
        User inspector = new User(normalizedEmail, encodedPassword, Role.INSPECTOR, AccountStatus.ACTIVE);

        User saved = userRepository.save(inspector);

        log.info("Provisioned new inspector: id=[{}], email=[{}], role=[{}], status=[{}]",
                saved.getId(), saved.getEmail(), saved.getRole(), saved.getStatus());

        return InspectorResponse.from(saved);
    }

    /**
     * Retrieves all registered Inspector user accounts.
     *
     * @return list of InspectorResponse
     */
    public List<InspectorResponse> getAllInspectors() {
        return userRepository.findAllByRoleOrderByIdAsc(Role.INSPECTOR)
                .stream()
                .map(InspectorResponse::from)
                .toList();
    }

    /**
     * Retrieves a single Inspector account by user ID.
     *
     * @param id inspector user ID
     * @return InspectorResponse
     * @throws ResourceNotFoundException if user does not exist or does not have ROLE_INSPECTOR
     */
    public InspectorResponse getInspectorById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inspector not found with id: " + id));

        if (user.getRole() != Role.INSPECTOR) {
            log.warn("User with id=[{}] exists but is not an INSPECTOR (Role: [{}])", id, user.getRole());
            throw new ResourceNotFoundException("Inspector not found with id: " + id);
        }

        return InspectorResponse.from(user);
    }
}
