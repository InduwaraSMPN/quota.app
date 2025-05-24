package com.quotaapp.backend.repository.primary;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.QuotaHistory;
import com.quotaapp.backend.model.VehicleClass;

/**
 * Repository for quota history
 */
@Repository
public interface QuotaHistoryRepository extends JpaRepository<QuotaHistory, Long> {
    
    /**
     * Find all quota history entries ordered by changed at date (descending)
     * 
     * @return a list of quota history entries
     */
    List<QuotaHistory> findAllByOrderByChangedAtDesc();
    
    /**
     * Find all quota history entries for a specific vehicle class ordered by changed at date (descending)
     * 
     * @param vehicleClass the vehicle class
     * @return a list of quota history entries
     */
    List<QuotaHistory> findByVehicleClassOrderByChangedAtDesc(VehicleClass vehicleClass);
    
}
