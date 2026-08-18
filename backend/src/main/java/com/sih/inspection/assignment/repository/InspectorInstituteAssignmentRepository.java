package com.sih.inspection.assignment.repository;

import com.sih.inspection.assignment.entity.AssignmentStatus;
import com.sih.inspection.assignment.entity.InspectorInstituteAssignment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link InspectorInstituteAssignment}.
 */
@Repository
public interface InspectorInstituteAssignmentRepository extends JpaRepository<InspectorInstituteAssignment, Long> {

    /**
     * Finds an assignment by ID, eagerly fetching inspector and institute to prevent N+1 queries.
     */
    @Override
    @EntityGraph(attributePaths = {"inspector", "institute"})
    Optional<InspectorInstituteAssignment> findById(Long id);

    /**
     * Finds all assignments with inspector and institute loaded in a single query.
     */
    @Override
    @EntityGraph(attributePaths = {"inspector", "institute"})
    List<InspectorInstituteAssignment> findAll();

    /**
     * Finds all assignments with a given status.
     */
    @EntityGraph(attributePaths = {"inspector", "institute"})
    List<InspectorInstituteAssignment> findByStatus(AssignmentStatus status);

    /**
     * Finds all active assignments for a specific inspector.
     */
    @EntityGraph(attributePaths = {"inspector", "institute"})
    List<InspectorInstituteAssignment> findByInspectorIdAndStatus(Long inspectorId, AssignmentStatus status);

    /**
     * Finds the active assignment for a specific institute (Enforcing single active inspector per institute).
     */
    @EntityGraph(attributePaths = {"inspector", "institute"})
    Optional<InspectorInstituteAssignment> findByInstituteIdAndStatus(Long instituteId, AssignmentStatus status);

    /**
     * Checks if an institute already has an active inspector assigned.
     */
    boolean existsByInstituteIdAndStatus(Long instituteId, AssignmentStatus status);

    /**
     * Checks if a specific inspector is actively assigned to an institute.
     */
    boolean existsByInspectorIdAndInstituteIdAndStatus(Long inspectorId, Long instituteId, AssignmentStatus status);
}
