package com.quotaapp.backend.repository.primary;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.User;
import com.quotaapp.backend.model.VehicleOwner;

@Repository
public interface VehicleOwnerRepository extends JpaRepository<VehicleOwner, Long> {
    
    /**
     * Find a vehicle owner by user
     * 
     * @param user the user to search for
     * @return an Optional containing the vehicle owner if found
     */
    Optional<VehicleOwner> findByUser(User user);
    
    /**
     * Find a vehicle owner by NIC number
     * 
     * @param nicNumber the NIC number to search for
     * @return an Optional containing the vehicle owner if found
     */
    Optional<VehicleOwner> findByNicNumber(String nicNumber);
    
    /**
     * Check if a vehicle owner exists with the given NIC number
     * 
     * @param nicNumber the NIC number to check
     * @return true if a vehicle owner exists with the NIC number, false otherwise
     */
    boolean existsByNicNumber(String nicNumber);
}