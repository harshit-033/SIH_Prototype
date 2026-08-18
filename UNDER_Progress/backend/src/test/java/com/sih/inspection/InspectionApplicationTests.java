
package com.sih.inspection;

import com.sih.inspection.exception.GlobalExceptionHandler;
import com.sih.inspection.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Integration smoke test: verifies the Spring application context loads
 * successfully.
 *
 * <p>
 * This test requires:
 * <ul>
 * <li>A running PostgreSQL instance (configured via
 * {@code application-local.yml} or env vars)</li>
 * <li>The {@code local} profile active (or explicit env vars set)</li>
 * </ul>
 *
 * <p>
 * To run without a real database, use {@code @DataJpaTest} or
 * {@code @WebMvcTest} for
 * unit-level slice tests in individual feature packages.
 */
@SpringBootTest
@ActiveProfiles("local")
class InspectionApplicationTests {

    @Test
    void contextLoads() {
        // If the application context starts, this test passes.
        // Verifies: DB connectivity, Flyway migration, Security config, Actuator setup.
    }
}
