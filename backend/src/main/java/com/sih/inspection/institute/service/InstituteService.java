package com.sih.inspection.institute.service;

import com.sih.inspection.exception.DuplicateResourceException;
import com.sih.inspection.exception.ResourceNotFoundException;
import com.sih.inspection.institute.dto.CreateInstituteRequest;
import com.sih.inspection.institute.dto.InstituteResponse;
import com.sih.inspection.institute.dto.UpdateInstituteRequest;
import com.sih.inspection.institute.entity.Institute;
import com.sih.inspection.institute.repository.InstituteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service managing domain business logic for {@link Institute} master data.
 */
@Service
@Transactional(readOnly = true)
public class InstituteService {

    private static final Logger log = LoggerFactory.getLogger(InstituteService.class);

    private final InstituteRepository instituteRepository;

    public InstituteService(InstituteRepository instituteRepository) {
        this.instituteRepository = instituteRepository;
    }

    /**
     * Creates a new institute record after verifying uniqueness of code and contact email.
     *
     * @param request creation request payload
     * @return InstituteResponse containing the persisted institute details
     * @throws DuplicateResourceException if institute code or email is already registered
     */
    @Transactional
    public InstituteResponse createInstitute(CreateInstituteRequest request) {
        if (instituteRepository.existsByCodeIgnoreCase(request.code())) {
            throw new DuplicateResourceException("Institute code '" + request.code() + "' is already registered");
        }

        if (instituteRepository.existsByContactEmailIgnoreCase(request.contactEmail())) {
            throw new DuplicateResourceException("Institute with contact email '" + request.contactEmail() + "' is already registered");
        }

        Institute institute = new Institute(
                request.name(),
                request.code(),
                request.address(),
                request.region(),
                request.city(),
                request.state(),
                request.contactEmail(),
                request.contactPhone(),
                request.getEffectiveStatus()
        );

        Institute saved = instituteRepository.save(institute);
        log.info("Created institute successfully: id=[{}], code=[{}], name=[{}]", saved.getId(), saved.getCode(), saved.getName());
        return InstituteResponse.from(saved);
    }

    /**
     * Retrieves an institute by its ID.
     *
     * @param id institute ID
     * @return InstituteResponse
     * @throws ResourceNotFoundException if no institute exists with the given ID
     */
    public InstituteResponse getInstituteById(Long id) {
        Institute institute = instituteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institute not found with id: " + id));
        return InstituteResponse.from(institute);
    }

    /**
     * Retrieves all registered institutes.
     *
     * @return list of InstituteResponse objects
     */
    public List<InstituteResponse> getAllInstitutes() {
        return instituteRepository.findAll()
                .stream()
                .map(InstituteResponse::from)
                .toList();
    }

    /**
     * Updates an existing institute record after verifying uniqueness of updated code/email against other institutes.
     *
     * @param id      institute ID to update
     * @param request update payload
     * @return updated InstituteResponse
     * @throws ResourceNotFoundException  if institute does not exist
     * @throws DuplicateResourceException if code or email conflicts with another institute
     */
    @Transactional
    public InstituteResponse updateInstitute(Long id, UpdateInstituteRequest request) {
        Institute existing = instituteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institute not found with id: " + id));

        if (instituteRepository.existsByCodeIgnoreCaseAndIdNot(request.code(), id)) {
            throw new DuplicateResourceException("Institute code '" + request.code() + "' is already in use by another institute");
        }

        if (instituteRepository.existsByContactEmailIgnoreCaseAndIdNot(request.contactEmail(), id)) {
            throw new DuplicateResourceException("Institute contact email '" + request.contactEmail() + "' is already in use by another institute");
        }

        existing.setName(request.name());
        existing.setCode(request.code());
        existing.setAddress(request.address());
        existing.setRegion(request.region());
        existing.setCity(request.city());
        existing.setState(request.state());
        existing.setContactEmail(request.contactEmail());
        existing.setContactPhone(request.contactPhone());
        existing.setStatus(request.status());

        Institute updated = instituteRepository.save(existing);
        log.info("Updated institute successfully: id=[{}], code=[{}], name=[{}]", updated.getId(), updated.getCode(), updated.getName());
        return InstituteResponse.from(updated);
    }
}
