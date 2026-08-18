package com.sih.inspection.auth.repository;

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
}
