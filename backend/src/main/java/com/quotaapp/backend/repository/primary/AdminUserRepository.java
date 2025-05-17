package com.quotaapp.backend.repository.primary;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.AdminUser;
import com.quotaapp.backend.model.User;

/**
 * Repository for AdminUser entity
 */
@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {
    
    /**
     * Find an admin user by user
     * 
     * @param user the user to search for
     * @return an Optional containing the admin user if found
     */
    Optional<AdminUser> findByUser(User user);
    
    /**
     * Find an admin user by employee ID
     * 
     * @param employeeId the employee ID to search for
     * @return an Optional containing the admin user if found
     */
    Optional<AdminUser> findByEmployeeId(String employeeId);
    
    /**
     * Check if an admin user exists with the given employee ID
     * 
     * @param employeeId the employee ID to check
     * @return true if an admin user exists with the employee ID, false otherwise
     */
    boolean existsByEmployeeId(String employeeId);
}
