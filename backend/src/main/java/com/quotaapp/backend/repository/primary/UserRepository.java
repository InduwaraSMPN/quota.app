package com.quotaapp.backend.repository.primary;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.Role;
import com.quotaapp.backend.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Count users who have logged in after a specific date
     *
     * @param date the date to check against
     * @return the count of users who have logged in after the date
     */
    long countByLastLoginAfter(LocalDateTime date);

    /**
     * Find a user by email
     *
     * @param email the email to search for
     * @return an Optional containing the user if found
     */
    Optional<User> findByEmail(String email);

    // The findByUsername method has been removed
    // Use findByEmail instead

    /**
     * Check if a user exists with the given email
     *
     * @param email the email to check
     * @return true if a user exists with the email, false otherwise
     */
    boolean existsByEmail(String email);

    // The existsByUsername method has been removed
    // Use existsByEmail instead

    /**
     * Check if a user exists with the given email and has a vehicle owner record
     * This distinguishes between temporary users created for email verification
     * and fully registered users with vehicle owner records
     *
     * @param email the email to check
     * @return true if a user exists with the email and has a vehicle owner record, false otherwise
     */
    @Query("SELECT COUNT(u) > 0 FROM User u JOIN VehicleOwner vo ON u.id = vo.user.id WHERE u.email = :email")
    boolean existsByEmailAndHasVehicleOwner(@Param("email") String email);

    /**
     * Find users by role
     *
     * @param role the role to search for
     * @param pageable the pagination information
     * @return a page of users with the specified role
     */
    Page<User> findByRole(Role role, Pageable pageable);

    /**
     * Find users by role and active status
     *
     * @param role the role to search for
     * @param isActive the active status to search for
     * @param pageable the pagination information
     * @return a page of users with the specified role and active status
     */
    Page<User> findByRoleAndIsActive(Role role, boolean isActive, Pageable pageable);

    /**
     * Find users by role and email containing a search term (case-insensitive)
     *
     * @param role the role to search for
     * @param email the email search term
     * @param pageable the pagination information
     * @return a page of users with the specified role and email containing the search term
     */
    Page<User> findByRoleAndEmailContainingIgnoreCase(Role role, String email, Pageable pageable);

    /**
     * Find users by email containing a search term (case-insensitive)
     *
     * @param email the email search term
     * @param pageable the pagination information
     * @return a page of users with email containing the search term
     */
    Page<User> findByEmailContainingIgnoreCase(String email, Pageable pageable);

    /**
     * Find users by active status
     *
     * @param isActive the active status to search for
     * @param pageable the pagination information
     * @return a page of users with the specified active status
     */
    Page<User> findByIsActive(boolean isActive, Pageable pageable);

}