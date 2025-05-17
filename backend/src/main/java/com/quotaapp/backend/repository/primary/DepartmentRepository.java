package com.quotaapp.backend.repository.primary;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.Department;

/**
 * Repository for Department entity
 */
@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    
    /**
     * Find a department by name
     * 
     * @param name the name to search for
     * @return an Optional containing the department if found
     */
    Optional<Department> findByName(String name);
    
    /**
     * Check if a department exists with the given name
     * 
     * @param name the name to check
     * @return true if a department exists with the name, false otherwise
     */
    boolean existsByName(String name);
}
