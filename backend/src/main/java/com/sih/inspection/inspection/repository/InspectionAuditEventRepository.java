package com.sih.inspection.inspection.repository;

import com.sih.inspection.inspection.entity.InspectionAuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link InspectionAuditEvent} entities.
 */
@Repository
public interface InspectionAuditEventRepository extends JpaRepository<InspectionAuditEvent, Long> {

    List<InspectionAuditEvent> findByInspectionIdOrderByTimestampDesc(UUID inspectionId);
}
