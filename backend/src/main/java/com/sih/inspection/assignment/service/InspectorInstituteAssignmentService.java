package com.sih.inspection.assignment.service;

import com.sih.inspection.assignment.dto.AssignmentResponse;
import com.sih.inspection.assignment.dto.AssignmentSummaryResponse;
import com.sih.inspection.assignment.dto.CreateAssignmentRequest;
import com.sih.inspection.assignment.dto.InspectorSummaryResponse;
import com.sih.inspection.assignment.entity.AssignmentStatus;
import com.sih.inspection.assignment.entity.InspectorInstituteAssignment;
import com.sih.inspection.assignment.repository.InspectorInstituteAssignmentRepository;
import com.sih.inspection.auth.entity.AccountStatus;
import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.auth.entity.User;
import com.sih.inspection.auth.repository.UserRepository;
import com.sih.inspection.exception.DuplicateResourceException;
import com.sih.inspection.exception.ResourceNotFoundException;
import com.sih.inspection.institute.entity.Institute;
import com.sih.inspection.institute.entity.InstituteStatus;
import com.sih.inspection.institute.repository.InstituteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service managing domain business logic for Inspector ↔ Institute assignments.
 * <p>
 * Key Business Invariants:
 * <ul>
 *   <li>An Inspector can be assigned to multiple Institutes (1 : N)</li>
 *   <li>An Institute can have at most ONE active Inspector assigned at any given time (N : 1)</li>
 * </ul>
 * </p>
 */
@Service
@Transactional(readOnly = true)
public class InspectorInstituteAssignmentService {

    private static final Logger log = LoggerFactory.getLogger(InspectorInstituteAssignmentService.class);

    private final InspectorInstituteAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final InstituteRepository instituteRepository;

    public InspectorInstituteAssignmentService(
            InspectorInstituteAssignmentRepository assignmentRepository,
            UserRepository userRepository,
            InstituteRepository instituteRepository) {
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.instituteRepository = instituteRepository;
    }

    /**
     * Assigns an inspector to an institute.
     * Enforces that the inspector is an ACTIVE user with ROLE_INSPECTOR, the institute is ACTIVE,
     * and the institute does not already have an active inspector assigned.
     *
     * @param request creation request payload containing inspectorId and instituteId
     * @return AssignmentResponse containing detailed assignment info
     * @throws ResourceNotFoundException  if inspector or institute not found
     * @throws IllegalArgumentException   if inspector or institute is inactive or wrong role
     * @throws DuplicateResourceException if institute already has an active inspector
     */
    @Transactional
    public AssignmentResponse createAssignment(CreateAssignmentRequest request) {
        User inspector = userRepository.findById(request.inspectorId())
                .orElseThrow(() -> new ResourceNotFoundException("Inspector user not found with id: " + request.inspectorId()));

        if (inspector.getRole() != Role.INSPECTOR) {
            throw new IllegalArgumentException("User with ID " + request.inspectorId() + " is not an INSPECTOR (Role: " + inspector.getRole() + ")");
        }

        if (inspector.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalArgumentException("Cannot assign inactive inspector (Status: " + inspector.getStatus() + ")");
        }

        Institute institute = instituteRepository.findById(request.instituteId())
                .orElseThrow(() -> new ResourceNotFoundException("Institute not found with id: " + request.instituteId()));

        if (institute.getStatus() != InstituteStatus.ACTIVE) {
            throw new IllegalArgumentException("Cannot assign inspector to non-active institute (Status: " + institute.getStatus() + ")");
        }

        // Enforce Single Active Inspector per Institute rule
        if (assignmentRepository.existsByInstituteIdAndStatus(request.instituteId(), AssignmentStatus.ACTIVE)) {
            throw new DuplicateResourceException("Institute '" + institute.getName() + "' (ID: " + request.instituteId() + ") already has an active inspector assigned. Deactivate existing assignment before reassigning.");
        }

        InspectorInstituteAssignment assignment = new InspectorInstituteAssignment(inspector, institute);
        InspectorInstituteAssignment saved = assignmentRepository.save(assignment);

        log.info("Assigned inspector [{}] (id={}) to institute [{}] (id={})",
                inspector.getEmail(), inspector.getId(), institute.getName(), institute.getId());

        return AssignmentResponse.from(saved);
    }

    /**
     * Retrieves all assignments with optional status filter.
     *
     * @param status optional status filter (e.g. ACTIVE, INACTIVE)
     * @return list of AssignmentSummaryResponse
     */
    public List<AssignmentSummaryResponse> getAllAssignments(AssignmentStatus status) {
        List<InspectorInstituteAssignment> list = (status != null)
                ? assignmentRepository.findByStatus(status)
                : assignmentRepository.findAll();

        return list.stream()
                .map(AssignmentSummaryResponse::from)
                .toList();
    }

    /**
     * Retrieves a single assignment by its ID.
     *
     * @param id assignment ID
     * @return detailed AssignmentResponse
     * @throws ResourceNotFoundException if assignment does not exist
     */
    public AssignmentResponse getAssignmentById(Long id) {
        InspectorInstituteAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));

        return AssignmentResponse.from(assignment);
    }

    /**
     * Retrieves active assignments for the currently authenticated inspector.
     *
     * @param inspectorEmail authenticated user's email
     * @return list of active assignments for the inspector
     * @throws ResourceNotFoundException if inspector not found
     */
    public List<AssignmentSummaryResponse> getMyAssignments(String inspectorEmail) {
        User inspector = userRepository.findByEmailIgnoreCase(inspectorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + inspectorEmail));

        return assignmentRepository.findByInspectorIdAndStatus(inspector.getId(), AssignmentStatus.ACTIVE)
                .stream()
                .map(AssignmentSummaryResponse::from)
                .toList();
    }

    /**
     * Retrieves the active inspector assigned to a specific institute.
     *
     * @param instituteId institute ID
     * @return InspectorSummaryResponse or null if no active inspector
     * @throws ResourceNotFoundException if institute not found
     */
    public InspectorSummaryResponse getInspectorForInstitute(Long instituteId) {
        if (!instituteRepository.existsById(instituteId)) {
            throw new ResourceNotFoundException("Institute not found with id: " + instituteId);
        }

        return assignmentRepository.findByInstituteIdAndStatus(instituteId, AssignmentStatus.ACTIVE)
                .map(assignment -> InspectorSummaryResponse.from(assignment.getInspector()))
                .orElse(null);
    }

    /**
     * Soft-deactivates an existing active assignment (preserves history for inspection audit trails).
     *
     * @param id assignment ID to deactivate
     * @return updated AssignmentResponse
     * @throws ResourceNotFoundException if assignment not found
     * @throws IllegalArgumentException  if assignment is already inactive
     */
    @Transactional
    public AssignmentResponse deactivateAssignment(Long id) {
        InspectorInstituteAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));

        if (assignment.getStatus() == AssignmentStatus.INACTIVE) {
            throw new IllegalArgumentException("Assignment with id " + id + " is already INACTIVE");
        }

        assignment.deactivate();
        InspectorInstituteAssignment updated = assignmentRepository.save(assignment);

        log.info("Deactivated assignment id=[{}]: inspector=[{}], institute=[{}]",
                updated.getId(), updated.getInspector().getEmail(), updated.getInstitute().getName());

        return AssignmentResponse.from(updated);
    }
}
