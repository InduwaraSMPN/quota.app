package com.quotaapp.backend.repository.primary;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.FuelInventory;
import com.quotaapp.backend.model.FuelStation;
import com.quotaapp.backend.model.FuelType;

@Repository
public interface FuelInventoryRepository extends JpaRepository<FuelInventory, Long> {
    
    /**
     * Find all inventory records for a station
     * 
     * @param station the station to search for
     * @return a list of fuel inventory records
     */
    List<FuelInventory> findByStation(FuelStation station);
    
    /**
     * Find inventory record for a station and fuel type
     * 
     * @param station the station to search for
     * @param fuelType the fuel type to search for
     * @return the matching inventory record, if found
     */
    Optional<FuelInventory> findByStationAndFuelType(FuelStation station, FuelType fuelType);
    
    /**
     * Check if a station has inventory for a specific fuel type
     * 
     * @param station the station to check
     * @param fuelType the fuel type to check
     * @return true if the station has inventory for the fuel type, false otherwise
     */
    boolean existsByStationAndFuelType(FuelStation station, FuelType fuelType);
}
