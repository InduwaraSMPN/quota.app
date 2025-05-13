package com.quotaapp.backend.repository.primary;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.VehicleClass;

@Repository
public interface VehicleClassRepository extends JpaRepository<VehicleClass, Long> {
    
    /**
     * Find a vehicle class by code
     * 
     * @param code the code to search for
     * @return an Optional containing the vehicle class if found
     */
    Optional<VehicleClass> findByCode(String code);
    
    /**
     * Check if a vehicle class exists with the given code
     * 
     * @param code the code to check
     * @return true if a vehicle class exists with the code, false otherwise
     */
    boolean existsByCode(String code);
}