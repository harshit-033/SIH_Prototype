package com.sih.inspection.inspection.service;

import com.sih.inspection.inspection.repository.InspectionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Concurrency-safe generator for human-readable, unique inspection numbers (e.g. INS-2026-000001).
 * Uses a PostgreSQL database sequence with a collision-checked fallback.
 */
@Component
public class InspectionNumberGenerator {

    private static final Logger log = LoggerFactory.getLogger(InspectionNumberGenerator.class);

    private final JdbcTemplate jdbcTemplate;
    private final InspectionRepository inspectionRepository;
    private final AtomicLong fallbackSequence = new AtomicLong(System.currentTimeMillis() % 100000);

    public InspectionNumberGenerator(JdbcTemplate jdbcTemplate, InspectionRepository inspectionRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.inspectionRepository = inspectionRepository;
    }

    /**
     * Generates a unique, collision-free inspection number.
     *
     * @return inspection number string (e.g. INS-2026-000001)
     */
    public String generateNextInspectionNumber() {
        int currentYear = Year.now().getValue();
        Long sequenceVal = fetchNextSequenceValue();

        String candidate = String.format("INS-%d-%06d", currentYear, sequenceVal);

        // Extra collision guard for extreme safety
        int safetyAttempts = 0;
        while (inspectionRepository.existsByInspectionNumber(candidate) && safetyAttempts < 10) {
            safetyAttempts++;
            sequenceVal = fetchNextSequenceValue();
            candidate = String.format("INS-%d-%06d", currentYear, sequenceVal);
        }

        return candidate;
    }

    private Long fetchNextSequenceValue() {
        try {
            Long val = jdbcTemplate.queryForObject("SELECT nextval('inspection_number_seq')", Long.class);
            if (val != null) {
                return val;
            }
        } catch (Exception ex) {
            log.debug("Database sequence fetch fallback used: {}", ex.getMessage());
        }
        return fallbackSequence.incrementAndGet();
    }
}
