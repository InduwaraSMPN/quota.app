package com.quotaapp.backend.repository.primary;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.FuelQuota;
import com.quotaapp.backend.model.Vehicle;

@Repository
public interface FuelQuotaRepository extends JpaRepository<FuelQuota, Long> {

    /**
     * Find all quotas for a vehicle
     *
     * @param vehicle the vehicle to search for
     * @return a list of fuel quotas
     */
    List<FuelQuota> findByVehicle(Vehicle vehicle);

    /**
     * Calculate the sum of all allocated fuel amounts
     *
     * @return the total allocated amount
     */
    @Query("SELECT COALESCE(SUM(q.allocatedAmount), 0) FROM FuelQuota q")
    BigDecimal sumTotalAllocatedAmount();

    /**
     * Find all active quotas for a vehicle (where current date is between allocation and expiry dates)
     *
     * @param vehicle the vehicle to search for
     * @param currentDate the current date
     * @return a list of active fuel quotas
     */
    @Query("SELECT q FROM FuelQuota q WHERE q.vehicle = :vehicle AND :currentDate BETWEEN q.allocationDate AND q.expiryDate ORDER BY q.expiryDate ASC")
    List<FuelQuota> findActiveQuotasByVehicle(@Param("vehicle") Vehicle vehicle, @Param("currentDate") LocalDate currentDate);

    /**
     * Find the current active quota for a vehicle
     *
     * @param vehicle the vehicle to search for
     * @param currentDate the current date
     * @return an Optional containing the active fuel quota if found
     */
    @Query("SELECT q FROM FuelQuota q WHERE q.vehicle = :vehicle AND :currentDate BETWEEN q.allocationDate AND q.expiryDate ORDER BY q.expiryDate ASC")
    Optional<FuelQuota> findCurrentQuotaByVehicle(@Param("vehicle") Vehicle vehicle, @Param("currentDate") LocalDate currentDate);

    /**
     * Find all expired quotas for a vehicle
     *
     * @param vehicle the vehicle to search for
     * @param currentDate the current date
     * @return a list of expired fuel quotas
     */
    @Query("SELECT q FROM FuelQuota q WHERE q.vehicle = :vehicle AND q.expiryDate < :currentDate ORDER BY q.expiryDate DESC")
    List<FuelQuota> findExpiredQuotasByVehicle(@Param("vehicle") Vehicle vehicle, @Param("currentDate") LocalDate currentDate);

    /**
     * Find all future quotas for a vehicle
     *
     * @param vehicle the vehicle to search for
     * @param currentDate the current date
     * @return a list of future fuel quotas
     */
    @Query("SELECT q FROM FuelQuota q WHERE q.vehicle = :vehicle AND q.allocationDate > :currentDate ORDER BY q.allocationDate ASC")
    List<FuelQuota> findFutureQuotasByVehicle(@Param("vehicle") Vehicle vehicle, @Param("currentDate") LocalDate currentDate);

    /**
     * Find all quotas for a vehicle by vehicle ID
     *
     * @param vehicleId the vehicle ID to search for
     * @return a list of fuel quotas
     */
    @Query("SELECT q FROM FuelQuota q WHERE q.vehicle.id = :vehicleId")
    List<FuelQuota> findByVehicleId(@Param("vehicleId") Long vehicleId);

    /**
     * Find the current active quota for a vehicle by vehicle ID
     *
     * @param vehicleId the vehicle ID to search for
     * @param currentDate the current date
     * @return an Optional containing the active fuel quota if found
     */
    @Query("SELECT q FROM FuelQuota q WHERE q.vehicle.id = :vehicleId AND :currentDate BETWEEN q.allocationDate AND q.expiryDate ORDER BY q.expiryDate ASC")
    Optional<FuelQuota> findCurrentQuotaByVehicleId(@Param("vehicleId") Long vehicleId, @Param("currentDate") LocalDate currentDate);
}
