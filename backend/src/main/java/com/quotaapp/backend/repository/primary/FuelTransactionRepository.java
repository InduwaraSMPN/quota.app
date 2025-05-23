package com.quotaapp.backend.repository.primary;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.FuelStation;
import com.quotaapp.backend.model.FuelTransaction;
import com.quotaapp.backend.model.FuelType;
import com.quotaapp.backend.model.Vehicle;

@Repository
public interface FuelTransactionRepository extends JpaRepository<FuelTransaction, Long> {

    /**
     * Calculate the sum of all fuel transaction amounts
     *
     * @return the total fuel amount consumed
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM FuelTransaction t")
    BigDecimal sumTotalFuelAmount();

    /**
     * Count transactions by station and date range
     *
     * @param station the station
     * @param startDate the start date
     * @param endDate the end date
     * @return the count of transactions
     */
    long countByStationAndTransactionDateBetween(FuelStation station, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find all transactions for a vehicle
     *
     * @param vehicle the vehicle to search for
     * @return a list of fuel transactions
     */
    List<FuelTransaction> findByVehicle(Vehicle vehicle);

    /**
     * Find all transactions for a vehicle with pagination
     *
     * @param vehicle the vehicle to search for
     * @param pageable the pagination information
     * @return a page of fuel transactions
     */
    Page<FuelTransaction> findByVehicle(Vehicle vehicle, Pageable pageable);

    /**
     * Find all transactions for a station
     *
     * @param station the station to search for
     * @return a list of fuel transactions
     */
    List<FuelTransaction> findByStation(FuelStation station);

    /**
     * Find all transactions for a station with pagination
     *
     * @param station the station to search for
     * @param pageable the pagination information
     * @return a page of fuel transactions
     */
    Page<FuelTransaction> findByStation(FuelStation station, Pageable pageable);

    /**
     * Find all transactions for a vehicle by vehicle ID
     *
     * @param vehicleId the vehicle ID to search for
     * @return a list of fuel transactions
     */
    @Query("SELECT t FROM FuelTransaction t WHERE t.vehicle.id = :vehicleId ORDER BY t.transactionDate DESC")
    List<FuelTransaction> findByVehicleId(@Param("vehicleId") Long vehicleId);

    /**
     * Find all transactions for a vehicle by vehicle ID with pagination
     *
     * @param vehicleId the vehicle ID to search for
     * @param pageable the pagination information
     * @return a page of fuel transactions
     */
    @Query("SELECT t FROM FuelTransaction t WHERE t.vehicle.id = :vehicleId ORDER BY t.transactionDate DESC")
    Page<FuelTransaction> findByVehicleId(@Param("vehicleId") Long vehicleId, Pageable pageable);

    /**
     * Find all transactions for a station by station ID
     *
     * @param stationId the station ID to search for
     * @return a list of fuel transactions
     */
    @Query("SELECT t FROM FuelTransaction t WHERE t.station.id = :stationId ORDER BY t.transactionDate DESC")
    List<FuelTransaction> findByStationId(@Param("stationId") Long stationId);

    /**
     * Find all transactions for a station by station ID with pagination
     *
     * @param stationId the station ID to search for
     * @param pageable the pagination information
     * @return a page of fuel transactions
     */
    @Query("SELECT t FROM FuelTransaction t WHERE t.station.id = :stationId ORDER BY t.transactionDate DESC")
    Page<FuelTransaction> findByStationId(@Param("stationId") Long stationId, Pageable pageable);

    /**
     * Find all transactions for a vehicle by vehicle ID and date range
     *
     * @param vehicleId the vehicle ID to search for
     * @param startDate the start date
     * @param endDate the end date
     * @return a list of fuel transactions
     */
    @Query("SELECT t FROM FuelTransaction t WHERE t.vehicle.id = :vehicleId AND t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    List<FuelTransaction> findByVehicleIdAndDateRange(
            @Param("vehicleId") Long vehicleId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Find all transactions for a station by station ID and date range
     *
     * @param stationId the station ID to search for
     * @param startDate the start date
     * @param endDate the end date
     * @return a list of fuel transactions
     */
    @Query("SELECT t FROM FuelTransaction t WHERE t.station.id = :stationId AND t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    List<FuelTransaction> findByStationIdAndDateRange(
            @Param("stationId") Long stationId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Count transactions for a station by station ID and date range
     *
     * @param stationId the station ID to search for
     * @param startDate the start date
     * @param endDate the end date
     * @return the count of transactions
     */
    @Query("SELECT COUNT(t) FROM FuelTransaction t WHERE t.station.id = :stationId AND t.transactionDate BETWEEN :startDate AND :endDate")
    long countByStationIdAndDateRange(
            @Param("stationId") Long stationId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Find all transactions for a vehicle by vehicle ID and fuel type
     *
     * @param vehicleId the vehicle ID to search for
     * @param fuelType the fuel type to search for
     * @return a list of fuel transactions
     */
    @Query("SELECT t FROM FuelTransaction t WHERE t.vehicle.id = :vehicleId AND t.fuelType = :fuelType ORDER BY t.transactionDate DESC")
    List<FuelTransaction> findByVehicleIdAndFuelType(
            @Param("vehicleId") Long vehicleId,
            @Param("fuelType") FuelType fuelType);
}
