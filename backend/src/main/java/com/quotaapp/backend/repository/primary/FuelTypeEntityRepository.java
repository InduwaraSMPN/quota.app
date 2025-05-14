package com.quotaapp.backend.repository.primary;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.FuelType;
import com.quotaapp.backend.model.FuelTypeEntity;

@Repository
public interface FuelTypeEntityRepository extends JpaRepository<FuelTypeEntity, Long> {
    
    /**
     * Find a fuel type entity by fuel type
     * 
     * @param fuelType the fuel type to search for
     * @return an Optional containing the fuel type entity if found
     */
    Optional<FuelTypeEntity> findByFuelType(FuelType fuelType);
    
    /**
     * Check if a fuel type entity exists with the given fuel type
     * 
     * @param fuelType the fuel type to check
     * @return true if a fuel type entity exists with the fuel type, false otherwise
     */
    boolean existsByFuelType(FuelType fuelType);
}
