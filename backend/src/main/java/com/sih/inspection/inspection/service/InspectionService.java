package com.sih.inspection.inspection.service;

import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.exception.ResourceNotFoundException;
import com.sih.inspection.inspection.dto.CreateInspectionRequest;
import com.sih.inspection.inspection.dto.InspectionResponse;
import com.sih.inspection.inspection.entity.Inspection;
import com.sih.inspection.inspection.enums.InspectionStatus;
import com.sih.inspection.inspection.enums.InspectionType;
import com.sih.inspection.inspection.repository.InspectionRepository;
import com.sih.inspection.institute.entity.Institute;
import com.sih.inspection.institute.entity.InstituteStatus;
import com.sih.inspection.institute.repository.InstituteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Core business service managing the Inspection lifecycle and role-based access boundaries.
 */
@Service
public class InspectionService {

    private static final Logger log = LoggerFactory.getLogger(InspectionService.class);

    private final InspectionRepository inspectionRepository;
    private final InstituteRepository instituteRepository;
    private final InspectionNumberGenerator numberGenerator;
    private final InspectionAuditService auditService;

    public InspectionService(InspectionRepository inspectionRepository,
                             InstituteRepository instituteRepository,
                             InspectionNumberGenerator numberGenerator,
                             InspectionAuditService auditService) {
        this.inspectionRepository = inspectionRepository;
        this.instituteRepository = instituteRepository;
        this.numberGenerator = numberGenerator;
        this.auditService = auditService;
    }

    /**
     * Creates / requests a new inspection.
     * Institute users automatically have their institute resolved from their authenticated profile.
     * Admin users may specify an explicit instituteId.
     */
    @Transactional
    public InspectionResponse createInspection(CreateInspectionRequest request, String authenticatedEmail, Role userRole) {
        Institute institute = resolveInstituteForCreation(request, authenticatedEmail, userRole);

        if (institute.getStatus() != InstituteStatus.ACTIVE) {
            throw new IllegalArgumentException("Cannot create an inspection for an inactive institute: " + institute.getName());
        }

        String inspectionNumber = numberGenerator.generateNextInspectionNumber();
        InspectionType type = request.inspectionType() != null ? request.inspectionType() : InspectionType.FULL_INSPECTION;

        Inspection inspection = new Inspection(inspectionNumber, institute, type);
        Inspection saved = inspectionRepository.save(inspection);

        log.info("Inspection created: number=[{}], id=[{}], institute=[{}], type=[{}], requestedBy=[{}]",
                saved.getInspectionNumber(), saved.getId(), institute.getName(), type, authenticatedEmail);

        auditService.recordEvent(
                saved.getId(),
                "INSPECTION_CREATED",
                authenticatedEmail,
                Map.of(
                        "inspectionNumber", saved.getInspectionNumber(),
                        "instituteId", institute.getId(),
                        "inspectionType", type.name()
                )
        );

        return InspectionResponse.from(saved);
    }

    /**
     * Transitions an inspection from REQUESTED to PROCESSING.
     */
    @Transactional
    public InspectionResponse startInspection(UUID inspectionId, String authenticatedEmail, Role userRole) {
        Inspection inspection = getInspectionEntity(inspectionId);
        validateOwnershipOrAdmin(inspection, authenticatedEmail, userRole);

        if (inspection.getStatus() == InspectionStatus.PROCESSING) {
            log.info("Inspection [{}] is already in PROCESSING state", inspectionId);
            return InspectionResponse.from(inspection);
        }

        if (inspection.getStatus() != InspectionStatus.REQUESTED) {
            throw new IllegalArgumentException("Cannot start inspection in status: " + inspection.getStatus() + ". Only REQUESTED inspections can be started.");
        }

        inspection.start();
        Inspection saved = inspectionRepository.save(inspection);

        log.info("Inspection started: id=[{}], number=[{}], startedBy=[{}]", saved.getId(), saved.getInspectionNumber(), authenticatedEmail);

        auditService.recordEvent(
                saved.getId(),
                "INSPECTION_STARTED",
                authenticatedEmail,
                Map.of("startedAt", saved.getStartedAt().toString())
        );

        return InspectionResponse.from(saved);
    }

    /**
     * Cancels an inspection in REQUESTED status.
     */
    @Transactional
    public InspectionResponse cancelInspection(UUID inspectionId, String reason, String authenticatedEmail, Role userRole) {
        Inspection inspection = getInspectionEntity(inspectionId);
        validateOwnershipOrAdmin(inspection, authenticatedEmail, userRole);

        if (inspection.getStatus() != InspectionStatus.REQUESTED) {
            throw new IllegalArgumentException("Cannot cancel inspection in status: " + inspection.getStatus() + ". Only REQUESTED inspections can be cancelled.");
        }

        inspection.cancel();
        if (reason != null && !reason.isBlank()) {
            inspection.setFailureReason(reason);
        }
        Inspection saved = inspectionRepository.save(inspection);

        log.info("Inspection cancelled: id=[{}], number=[{}], cancelledBy=[{}]", saved.getId(), saved.getInspectionNumber(), authenticatedEmail);

        auditService.recordEvent(
                saved.getId(),
                "INSPECTION_CANCELLED",
                authenticatedEmail,
                Map.of("reason", reason != null ? reason : "User cancelled")
        );

        return InspectionResponse.from(saved);
    }

    /**
     * Retrieves an inspection by UUID, enforcing institute data isolation.
     */
    @Transactional(readOnly = true)
    public InspectionResponse getInspectionById(UUID inspectionId, String authenticatedEmail, Role userRole) {
        Inspection inspection = getInspectionEntity(inspectionId);
        validateOwnershipOrAdmin(inspection, authenticatedEmail, userRole);
        return InspectionResponse.from(inspection);
    }

    /**
     * Lists inspections with pagination and optional filtering by status and type.
     * Strictly isolates institute users to only view their own records.
     */
    @Transactional(readOnly = true)
    public Page<InspectionResponse> listInspections(Pageable pageable,
                                                    InspectionStatus status,
                                                    InspectionType type,
                                                    String authenticatedEmail,
                                                    Role userRole) {
        if (userRole == Role.INSTITUTE) {
            Institute institute = instituteRepository.findByContactEmailIgnoreCase(authenticatedEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("No institute found associated with email: " + authenticatedEmail));

            if (status != null && type != null) {
                return inspectionRepository.findByInstituteIdAndStatusAndInspectionType(institute.getId(), status, type, pageable)
                        .map(InspectionResponse::from);
            } else if (status != null) {
                return inspectionRepository.findByInstituteIdAndStatus(institute.getId(), status, pageable)
                        .map(InspectionResponse::from);
            } else if (type != null) {
                return inspectionRepository.findByInstituteIdAndInspectionType(institute.getId(), type, pageable)
                        .map(InspectionResponse::from);
            } else {
                return inspectionRepository.findByInstituteId(institute.getId(), pageable)
                        .map(InspectionResponse::from);
            }
        }

        // ADMIN / INSPECTOR view
        if (status != null && type != null) {
            return inspectionRepository.findByStatusAndInspectionType(status, type, pageable)
                    .map(InspectionResponse::from);
        } else if (status != null) {
            return inspectionRepository.findByStatus(status, pageable)
                    .map(InspectionResponse::from);
        } else if (type != null) {
            return inspectionRepository.findByInspectionType(type, pageable)
                    .map(InspectionResponse::from);
        } else {
            return inspectionRepository.findAll(pageable)
                    .map(InspectionResponse::from);
        }
    }

    /**
     * Internal entity lookup with eager relations.
     */
    @Transactional(readOnly = true)
    public Inspection getInspectionEntity(UUID inspectionId) {
        return inspectionRepository.findByIdWithDetails(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inspection not found with ID: " + inspectionId));
    }

    private Institute resolveInstituteForCreation(CreateInspectionRequest request, String authenticatedEmail, Role userRole) {
        if (userRole == Role.ADMIN && request.instituteId() != null) {
            return instituteRepository.findById(request.instituteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Institute not found with ID: " + request.instituteId()));
        }

        return instituteRepository.findByContactEmailIgnoreCase(authenticatedEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No institute found associated with contact email: " + authenticatedEmail +
                                (userRole == Role.ADMIN ? ". As ADMIN, please provide an explicit 'instituteId'." : "")
                ));
    }

    private void validateOwnershipOrAdmin(Inspection inspection, String authenticatedEmail, Role userRole) {
        if (userRole == Role.ADMIN || userRole == Role.INSPECTOR) {
            return;
        }

        if (userRole == Role.INSTITUTE) {
            String instituteEmail = inspection.getInstitute().getContactEmail();
            if (instituteEmail == null || !instituteEmail.equalsIgnoreCase(authenticatedEmail)) {
                throw new AccessDeniedException("Access denied: You cannot view or modify an inspection belonging to another institute.");
            }
        }
    }
}
