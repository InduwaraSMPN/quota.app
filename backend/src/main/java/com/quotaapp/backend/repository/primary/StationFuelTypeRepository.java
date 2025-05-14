package com.quotaapp.backend.repository.primary;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.FuelStation;
import com.quotaapp.backend.model.FuelType;
import com.quotaapp.backend.model.StationFuelType;

@Repository
public interface StationFuelTypeRepository extends JpaRepository<StationFuelType, Long> {
    
    /**
     * Find all fuel types for a station
     * 
     * @param station the station to search for
     * @return a list of station fuel types
     */
    List<StationFuelType> findByStation(FuelStation station);
    
    /**
     * Check if a station has a specific fuel type
     * 
     * @param station the station to check
     * @param fuelType the fuel type to check
     * @return true if the station has the fuel type, false otherwise
     */
    boolean existsByStationAndFuelType(FuelStation station, FuelType fuelType);
}
