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
    public void enforceSingleAdminDatabaseConstraint() {
        try {
            jdbcTemplate.execute(
                    "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_single_admin ON users (role) WHERE role = 'ADMIN';"
            );
            log.info("PostgreSQL single-ADMIN partial unique index verified: [idx_users_single_admin]");
        } catch (Exception ex) {
            log.warn("Could not apply single-admin partial unique index (may already exist or non-PostgreSQL DB): {}", ex.getMessage());
        }
    }
}
