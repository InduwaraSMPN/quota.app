package com.quotaapp.backend.repository.primary;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.District;
import com.quotaapp.backend.model.Province;

@Repository
public interface DistrictRepository extends JpaRepository<District, Long> {
    
    /**
     * Find a district by name and province
     * 
     * @param name the name to search for
     * @param province the province to search in
     * @return an Optional containing the district if found
     */
    Optional<District> findByNameAndProvince(String name, Province province);
    
    /**
     * Find all districts in a province
     * 
     * @param province the province to search in
     * @return a list of districts in the province
     */
    List<District> findByProvince(Province province);
    
    /**
     * Check if a district exists with the given name and province
     * 
     * @param name the name to check
     * @param province the province to check in
     * @return true if a district exists with the name and province, false otherwise
     */
    boolean existsByNameAndProvince(String name, Province province);
}
