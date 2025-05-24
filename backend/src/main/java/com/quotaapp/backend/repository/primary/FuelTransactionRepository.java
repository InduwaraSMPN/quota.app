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
     * Find all transactions for a vehicle by vehicle ID and date range with pagination
     *
     * @param vehicleId the vehicle ID to search for
     * @param startDate the start date
     * @param endDate the end date
     * @param pageable the pagination information
     * @return a page of fuel transactions
     */
    @Query("SELECT t FROM FuelTransaction t WHERE t.vehicle.id = :vehicleId AND t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    Page<FuelTransaction> findByVehicleIdAndTransactionDateBetween(
            @Param("vehicleId") Long vehicleId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    /**
     * Find all transactions for a vehicle by vehicle ID, date range, and fuel type
     *
     * @param vehicleId the vehicle ID to search for
     * @param startDate the start date
     * @param endDate the end date
     * @param fuelType the fuel type to search for
     * @return a list of fuel transactions
     */
    @Query("SELECT t FROM FuelTransaction t WHERE t.vehicle.id = :vehicleId AND t.transactionDate BETWEEN :startDate AND :endDate AND t.fuelType = :fuelType ORDER BY t.transactionDate DESC")
    List<FuelTransaction> findByVehicleIdAndTransactionDateBetweenAndFuelType(
            @Param("vehicleId") Long vehicleId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("fuelType") FuelType fuelType);

    /**
     * Find all transactions for a vehicle by vehicle ID, date range, and fuel type with pagination
     *
     * @param vehicleId the vehicle ID to search for
     * @param startDate the start date
     * @param endDate the end date
     * @param fuelType the fuel type to search for
     * @param pageable the pagination information
     * @return a page of fuel transactions
     */
    @Query("SELECT t FROM FuelTransaction t WHERE t.vehicle.id = :vehicleId AND t.transactionDate BETWEEN :startDate AND :endDate AND t.fuelType = :fuelType ORDER BY t.transactionDate DESC")
    Page<FuelTransaction> findByVehicleIdAndTransactionDateBetweenAndFuelType(
            @Param("vehicleId") Long vehicleId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("fuelType") FuelType fuelType,
            Pageable pageable);

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
     * Find all transactions for a station by station ID and date range with pagination
     *
     * @param stationId the station ID to search for
     * @param startDate the start date
     * @param endDate the end date
     * @param pageable the pagination information
     * @return a page of fuel transactions
     */
    @Query("SELECT t FROM FuelTransaction t WHERE t.station.id = :stationId AND t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    Page<FuelTransaction> findByStationIdAndTransactionDateBetween(
            @Param("stationId") Long stationId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    /**
     * Find all transactions for a station by station ID, date range, and fuel type
     *
     * @param stationId the station ID to search for
     * @param startDate the start date
     * @param endDate the end date
     * @param fuelType the fuel type to search for
     * @return a list of fuel transactions
     */
    @Query("SELECT t FROM FuelTransaction t WHERE t.station.id = :stationId AND t.transactionDate BETWEEN :startDate AND :endDate AND t.fuelType = :fuelType ORDER BY t.transactionDate DESC")
    List<FuelTransaction> findByStationIdAndTransactionDateBetweenAndFuelType(
            @Param("stationId") Long stationId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("fuelType") FuelType fuelType);

    /**
     * Find all transactions for a station by station ID, date range, and fuel type with pagination
     *
     * @param stationId the station ID to search for
     * @param startDate the start date
     * @param endDate the end date
     * @param fuelType the fuel type to search for
     * @param pageable the pagination information
     * @return a page of fuel transactions
     */
    @Query("SELECT t FROM FuelTransaction t WHERE t.station.id = :stationId AND t.transactionDate BETWEEN :startDate AND :endDate AND t.fuelType = :fuelType ORDER BY t.transactionDate DESC")
    Page<FuelTransaction> findByStationIdAndTransactionDateBetweenAndFuelType(
            @Param("stationId") Long stationId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("fuelType") FuelType fuelType,
            Pageable pageable);

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

    /**
     * Find all transactions for a vehicle by vehicle ID and fuel type with pagination
     *
     * @param vehicleId the vehicle ID to search for
     * @param fuelType the fuel type to search for
     * @param pageable the pagination information
     * @return a page of fuel transactions
     */
    @Query("SELECT t FROM FuelTransaction t WHERE t.vehicle.id = :vehicleId AND t.fuelType = :fuelType ORDER BY t.transactionDate DESC")
    Page<FuelTransaction> findByVehicleIdAndFuelType(
            @Param("vehicleId") Long vehicleId,
            @Param("fuelType") FuelType fuelType,
            Pageable pageable);

    /**
     * Find all transactions for a station by station ID and fuel type
     *
     * @param stationId the station ID to search for
     * @param fuelType the fuel type to search for
     * @return a list of fuel transactions
     */
    @Query("SELECT t FROM FuelTransaction t WHERE t.station.id = :stationId AND t.fuelType = :fuelType ORDER BY t.transactionDate DESC")
    List<FuelTransaction> findByStationIdAndFuelType(
            @Param("stationId") Long stationId,
            @Param("fuelType") FuelType fuelType);

    /**
     * Find all transactions for a station by station ID and fuel type with pagination
     *
     * @param stationId the station ID to search for
     * @param fuelType the fuel type to search for
     * @param pageable the pagination information
     * @return a page of fuel transactions
     */
    @Query("SELECT t FROM FuelTransaction t WHERE t.station.id = :stationId AND t.fuelType = :fuelType ORDER BY t.transactionDate DESC")
    Page<FuelTransaction> findByStationIdAndFuelType(
            @Param("stationId") Long stationId,
            @Param("fuelType") FuelType fuelType,
            Pageable pageable);

    /**
     * Find all transactions by fuel type
     *
     * @param fuelType the fuel type to search for
     * @return a list of fuel transactions
     */
    List<FuelTransaction> findByFuelType(FuelType fuelType);

    /**
     * Find all transactions by fuel type with pagination
     *
     * @param fuelType the fuel type to search for
     * @param pageable the pagination information
     * @return a page of fuel transactions
     */
    Page<FuelTransaction> findByFuelType(FuelType fuelType, Pageable pageable);

    /**
     * Find all transactions by date range
     *
     * @param startDate the start date
     * @param endDate the end date
     * @return a list of fuel transactions
     */
    List<FuelTransaction> findByTransactionDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find all transactions by date range with pagination
     *
     * @param startDate the start date
     * @param endDate the end date
     * @param pageable the pagination information
     * @return a page of fuel transactions
     */
    Page<FuelTransaction> findByTransactionDateBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    /**
     * Find all transactions by date range and fuel type
     *
     * @param startDate the start date
     * @param endDate the end date
     * @param fuelType the fuel type to search for
     * @return a list of fuel transactions
     */
    List<FuelTransaction> findByTransactionDateBetweenAndFuelType(
            LocalDateTime startDate,
            LocalDateTime endDate,
            FuelType fuelType);

    /**
     * Find all transactions by date range and fuel type with pagination
     *
     * @param startDate the start date
     * @param endDate the end date
     * @param fuelType the fuel type to search for
     * @param pageable the pagination information
     * @return a page of fuel transactions
     */
    Page<FuelTransaction> findByTransactionDateBetweenAndFuelType(
            LocalDateTime startDate,
            LocalDateTime endDate,
            FuelType fuelType,
            Pageable pageable);
}
