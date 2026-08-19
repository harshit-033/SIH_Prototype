package com.sih.inspection.institute.repository;

import com.sih.inspection.institute.entity.Institute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Institute} entity.
 */
@Repository
public interface InstituteRepository extends JpaRepository<Institute, Long> {

    /**
     * Finds an institute by its unique institute code (case-insensitive).
     *
     * @param code institute code (e.g. ABCIT001)
     * @return Optional containing the Institute if found
     */
    Optional<Institute> findByCodeIgnoreCase(String code);

    /**
     * Checks if an institute exists with the given code (case-insensitive).
     *
     * @param code institute code
     * @return true if exists, false otherwise
     */
    boolean existsByCodeIgnoreCase(String code);

    /**
     * Checks if another institute with a different ID already has the given code.
     *
     * @param code institute code
     * @param id   current institute ID to exclude
     * @return true if another institute has this code
     */
    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);

    /**
     * Checks if an institute exists with the given contact email (case-insensitive).
     *
     * @param contactEmail contact email address
     * @return true if exists, false otherwise
     */
    boolean existsByContactEmailIgnoreCase(String contactEmail);

    /**
     * Checks if another institute with a different ID already has the given contact email.
     *
     * @param contactEmail contact email address
     * @param id           current institute ID to exclude
     * @return true if another institute has this email
     */
    boolean existsByContactEmailIgnoreCaseAndIdNot(String contactEmail, Long id);
}
