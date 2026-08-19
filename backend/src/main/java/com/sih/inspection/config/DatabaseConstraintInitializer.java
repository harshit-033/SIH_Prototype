package com.sih.inspection.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Database schema initializer that enforces the single-ADMIN invariant at the PostgreSQL storage engine level.
 * <p>
 * Creates a partial unique index on {@code users(role) WHERE role = 'ADMIN'}, guaranteeing concurrency safety
 * against race conditions.
 * </p>
 */
@Component
public class DatabaseConstraintInitializer {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConstraintInitializer.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseConstraintInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void enforceDatabaseConstraintsAndSequences() {
        try {
            jdbcTemplate.execute(
                    "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_single_admin ON users (role) WHERE role = 'ADMIN';"
            );
            log.info("PostgreSQL single-ADMIN partial unique index verified: [idx_users_single_admin]");
        } catch (Exception ex) {
            log.warn("Could not apply single-admin partial unique index: {}", ex.getMessage());
        }

        try {
            jdbcTemplate.execute(
                    "CREATE SEQUENCE IF NOT EXISTS inspection_number_seq START WITH 1 INCREMENT BY 1;"
            );
            log.info("PostgreSQL sequence verified: [inspection_number_seq]");
        } catch (Exception ex) {
            log.warn("Could not create inspection_number_seq sequence: {}", ex.getMessage());
        }

        try {
            jdbcTemplate.execute(
                    "ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;"
            );
            jdbcTemplate.execute(
                    "ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('ADMIN', 'INSPECTOR', 'INSTITUTE', 'ML_SERVICE'));"
            );
            log.info("PostgreSQL users_role_check constraint updated with ML_SERVICE");
        } catch (Exception ex) {
            log.warn("Could not update users_role_check constraint: {}", ex.getMessage());
        }
    }
}
