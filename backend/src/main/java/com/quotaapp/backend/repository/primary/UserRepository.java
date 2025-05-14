package com.quotaapp.backend.repository.primary;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

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
}