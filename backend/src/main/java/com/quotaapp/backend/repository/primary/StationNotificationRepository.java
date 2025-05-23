package com.quotaapp.backend.repository.primary;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.FuelStation;
import com.quotaapp.backend.model.StationNotification;

/**
 * Repository for StationNotification entity
 */
@Repository
public interface StationNotificationRepository extends JpaRepository<StationNotification, Long> {
    
    /**
     * Find all notifications for a station
     * 
     * @param station the station to search for
     * @return a list of notifications for the station
     */
    List<StationNotification> findByStationOrderByCreatedAtDesc(FuelStation station);
    
    /**
     * Find all unread notifications for a station
     * 
     * @param station the station to search for
     * @return a list of unread notifications for the station
     */
    List<StationNotification> findByStationAndIsReadFalseOrderByCreatedAtDesc(FuelStation station);
    
    /**
     * Count unread notifications for a station
     * 
     * @param station the station to count for
     * @return the count of unread notifications
     */
    long countByStationAndIsReadFalse(FuelStation station);
    
    /**
     * Find all notifications for a station by station ID
     * 
     * @param stationId the station ID to search for
     * @return a list of notifications for the station
     */
    @Query("SELECT n FROM StationNotification n WHERE n.station.id = :stationId ORDER BY n.createdAt DESC")
    List<StationNotification> findByStationIdOrderByCreatedAtDesc(@Param("stationId") Long stationId);
}
