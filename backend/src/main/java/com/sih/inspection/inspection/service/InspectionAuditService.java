package com.sih.inspection.inspection.service;

import com.sih.inspection.inspection.entity.InspectionAuditEvent;
import com.sih.inspection.inspection.repository.InspectionAuditEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service for logging structured audit events related to inspection lifecycle and ML processing.
 */
@Service
public class InspectionAuditService {

    private static final Logger log = LoggerFactory.getLogger(InspectionAuditService.class);

    private final InspectionAuditEventRepository auditEventRepository;

    public InspectionAuditService(InspectionAuditEventRepository auditEventRepository) {
        this.auditEventRepository = auditEventRepository;
    }

    /**
     * Records an audit event synchronously within the current transaction.
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public void recordEvent(UUID inspectionId, String action, String actor, Map<String, Object> details) {
        try {
            InspectionAuditEvent event = new InspectionAuditEvent(inspectionId, action, actor, details);
            auditEventRepository.save(event);
            log.info("Audit event recorded: action=[{}], inspectionId=[{}], actor=[{}]", action, inspectionId, actor);
        } catch (Exception ex) {
            log.error("Failed to record audit event for inspection [{}]: {}", inspectionId, ex.getMessage());
        }
    }

    /**
     * Retrieves audit event history for a given inspection.
     */
    @Transactional(readOnly = true)
    public List<InspectionAuditEvent> getEventsForInspection(UUID inspectionId) {
        return auditEventRepository.findByInspectionIdOrderByTimestampDesc(inspectionId);
    }
}
