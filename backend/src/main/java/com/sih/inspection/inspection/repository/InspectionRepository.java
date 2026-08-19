package com.sih.inspection.inspection.repository;

import com.sih.inspection.inspection.entity.Inspection;
import com.sih.inspection.inspection.enums.InspectionStatus;
import com.sih.inspection.inspection.enums.InspectionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link Inspection} entities.
 */
@Repository
public interface InspectionRepository extends JpaRepository<Inspection, UUID>, JpaSpecificationExecutor<Inspection> {

    @EntityGraph(attributePaths = {"institute", "result"})
    @Query("SELECT i FROM Inspection i WHERE i.id = :id")
    Optional<Inspection> findByIdWithDetails(@Param("id") UUID id);

    @EntityGraph(attributePaths = {"institute", "result"})
    Optional<Inspection> findByInspectionNumber(String inspectionNumber);

    boolean existsByInspectionNumber(String inspectionNumber);

    @EntityGraph(attributePaths = {"institute", "result"})
    Page<Inspection> findByInstituteId(Long instituteId, Pageable pageable);

    @EntityGraph(attributePaths = {"institute", "result"})
    Page<Inspection> findByInstituteIdAndStatus(Long instituteId, InspectionStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"institute", "result"})
    Page<Inspection> findByInstituteIdAndInspectionType(Long instituteId, InspectionType inspectionType, Pageable pageable);

    @EntityGraph(attributePaths = {"institute", "result"})
    Page<Inspection> findByInstituteIdAndStatusAndInspectionType(Long instituteId, InspectionStatus status, InspectionType inspectionType, Pageable pageable);

    @EntityGraph(attributePaths = {"institute", "result"})
    Page<Inspection> findByStatus(InspectionStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"institute", "result"})
    Page<Inspection> findByInspectionType(InspectionType inspectionType, Pageable pageable);

    @EntityGraph(attributePaths = {"institute", "result"})
    Page<Inspection> findByStatusAndInspectionType(InspectionStatus status, InspectionType inspectionType, Pageable pageable);
}
