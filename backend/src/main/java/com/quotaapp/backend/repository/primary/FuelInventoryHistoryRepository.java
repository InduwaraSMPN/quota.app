package com.quotaapp.backend.repository.primary;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.FuelInventory;
import com.quotaapp.backend.model.FuelInventoryHistory;

@Repository
public interface FuelInventoryHistoryRepository extends JpaRepository<FuelInventoryHistory, Long> {
    
    /**
     * Find all history records for an inventory
     * 
     * @param inventory the inventory to search for
     * @return a list of history records
     */
    List<FuelInventoryHistory> findByInventory(FuelInventory inventory);
    
    /**
     * Find all history records for an inventory with pagination
     * 
     * @param inventory the inventory to search for
     * @param pageable the pagination information
     * @return a page of history records
     */
    Page<FuelInventoryHistory> findByInventory(FuelInventory inventory, Pageable pageable);
    
    /**
     * Find all history records for an inventory between dates
     * 
     * @param inventory the inventory to search for
     * @param startDate the start date
     * @param endDate the end date
     * @return a list of history records
     */
    @Query("SELECT h FROM FuelInventoryHistory h WHERE h.inventory = :inventory AND h.createdAt BETWEEN :startDate AND :endDate ORDER BY h.createdAt DESC")
    List<FuelInventoryHistory> findByInventoryAndDateRange(
            @Param("inventory") FuelInventory inventory,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find all history records for an inventory between dates with pagination
     * 
     * @param inventory the inventory to search for
     * @param startDate the start date
     * @param endDate the end date
     * @param pageable the pagination information
     * @return a page of history records
     */
    @Query("SELECT h FROM FuelInventoryHistory h WHERE h.inventory = :inventory AND h.createdAt BETWEEN :startDate AND :endDate ORDER BY h.createdAt DESC")
    Page<FuelInventoryHistory> findByInventoryAndDateRange(
            @Param("inventory") FuelInventory inventory,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
}
