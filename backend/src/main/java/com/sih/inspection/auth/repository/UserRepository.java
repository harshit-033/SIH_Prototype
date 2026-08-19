package com.sih.inspection.auth.repository;

import com.sih.inspection.auth.entity.Role;
import com.sih.inspection.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link User} entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by email, ignoring case.
     *
     * @param email the user's email address
     * @return Optional containing the User if found
     */
    Optional<User> findByEmailIgnoreCase(String email);

    /**
     * Checks if a user exists with the given email, ignoring case.
     *
     * @param email the email to check
     * @return true if a user with this email exists
     */
    boolean existsByEmailIgnoreCase(String email);

    /**
     * Checks if an administrator account already exists.
     *
     * @param role the role to check (e.g. Role.ADMIN)
     * @return true if a user with this role exists
     */
    boolean existsByRole(Role role);

    /**
     * Checks if another user with a different ID has the specified role.
     * Used to prevent role escalation to ADMIN or creating a second ADMIN.
     *
     * @param role role to check
     * @param id   current user ID to exclude
     * @return true if another user has this role
     */
    boolean existsByRoleAndIdNot(Role role, Long id);

    /**
     * Counts the total number of users with a specific role.
     * Used to verify the single-ADMIN invariant (count must be <= 1).
     *
     * @param role the role to count
     * @return count of users with the given role
     */
    long countByRole(Role role);

    /**
     * Finds the single administrator user if present.
     *
     * @param role role (e.g. Role.ADMIN)
     * @return Optional containing the admin user
     */
    Optional<User> findByRole(Role role);
}
