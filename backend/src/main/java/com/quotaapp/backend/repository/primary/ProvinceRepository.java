package com.quotaapp.backend.repository.primary;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.Province;

@Repository
public interface ProvinceRepository extends JpaRepository<Province, Long> {
    
    /**
     * Find a province by name
     * 
     * @param name the name to search for
     * @return an Optional containing the province if found
     */
    Optional<Province> findByName(String name);
    
    /**
     * Check if a province exists with the given name
     * 
     * @param name the name to check
     * @return true if a province exists with the name, false otherwise
     */
    boolean existsByName(String name);
}
