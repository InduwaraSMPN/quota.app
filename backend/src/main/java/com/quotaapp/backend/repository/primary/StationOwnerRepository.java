package com.quotaapp.backend.repository.primary;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.StationOwner;
import com.quotaapp.backend.model.User;

@Repository
public interface StationOwnerRepository extends JpaRepository<StationOwner, Long> {
    
    /**
     * Find a station owner by user
     * 
     * @param user the user to search for
     * @return an Optional containing the station owner if found
     */
    Optional<StationOwner> findByUser(User user);
    
    /**
     * Find a station owner by NIC number
     * 
     * @param nicNumber the NIC number to search for
     * @return an Optional containing the station owner if found
     */
    Optional<StationOwner> findByNicNumber(String nicNumber);
    
    /**
     * Check if a station owner exists with the given NIC number
     * 
     * @param nicNumber the NIC number to check
     * @return true if a station owner exists with the NIC number, false otherwise
     */
    boolean existsByNicNumber(String nicNumber);
}
