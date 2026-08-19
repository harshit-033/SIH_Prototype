package com.sih.inspection.inspection.repository;

import com.sih.inspection.inspection.entity.InspectionResult;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link InspectionResult} entities.
 */
@Repository
public interface InspectionResultRepository extends JpaRepository<InspectionResult, Long> {

    @EntityGraph(attributePaths = {"inspection", "inspection.institute"})
    @Query("SELECT r FROM InspectionResult r WHERE r.inspection.id = :inspectionId")
    Optional<InspectionResult> findByInspectionId(@Param("inspectionId") UUID inspectionId);

    @Query("SELECT count(r) > 0 FROM InspectionResult r WHERE r.inspection.id = :inspectionId")
    boolean existsByInspectionId(@Param("inspectionId") UUID inspectionId);
}
