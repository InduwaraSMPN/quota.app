package com.quotaapp.backend.repository.primary;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.FuelStation;
import com.quotaapp.backend.model.StationOwner;

@Repository
public interface FuelStationRepository extends JpaRepository<FuelStation, Long> {

    /**
     * Count fuel stations by verification status
     *
     * @param verificationStatus the verification status to count
     * @return the count of fuel stations with the given verification status
     */
    long countByVerificationStatus(String verificationStatus);

    /**
     * Find a fuel station by business registration number
     *
     * @param businessRegistrationNumber the business registration number to search for
     * @return an Optional containing the fuel station if found
     */
    Optional<FuelStation> findByBusinessRegistrationNumber(String businessRegistrationNumber);

    /**
     * Find a fuel station by fuel retail license number
     *
     * @param fuelRetailLicenseNumber the fuel retail license number to search for
     * @return an Optional containing the fuel station if found
     */
    Optional<FuelStation> findByFuelRetailLicenseNumber(String fuelRetailLicenseNumber);

    /**
     * Find all fuel stations by owner
     *
     * @param owner the owner to search for
     * @return a list of fuel stations owned by the owner
     */
    List<FuelStation> findByOwner(StationOwner owner);

    /**
     * Check if a fuel station exists with the given business registration number
     *
     * @param businessRegistrationNumber the business registration number to check
     * @return true if a fuel station exists with the business registration number, false otherwise
     */
    boolean existsByBusinessRegistrationNumber(String businessRegistrationNumber);

    /**
     * Check if a fuel station exists with the given fuel retail license number
     *
     * @param fuelRetailLicenseNumber the fuel retail license number to check
     * @return true if a fuel station exists with the fuel retail license number, false otherwise
     */
    boolean existsByFuelRetailLicenseNumber(String fuelRetailLicenseNumber);

    /**
     * Find all fuel stations by verification status
     *
     * @param verificationStatus the verification status to search for
     * @return a list of fuel stations with the given verification status
     */
    List<FuelStation> findByVerificationStatus(String verificationStatus);

    /**
     * Find all pending stations for verification using a native query to avoid lazy loading issues
     *
     * @return a list of Object arrays containing station data
     */
    @Query(value = """
            SELECT
                fs.id,
                fs.station_name,
                fs.business_name,
                fs.business_registration_number,
                fs.business_address,
                fs.province,
                fs.district,
                so.full_name,
                so.contact_number,
                fs.created_at
            FROM
                fuel_stations fs
            JOIN
                station_owners so ON fs.owner_id = so.id
            WHERE
                fs.verification_status = 'PENDING'
            """,
            nativeQuery = true)
    List<Object[]> findPendingStationsForVerification();

    /**
     * Find the ID of a fuel station by owner
     *
     * @param owner the station owner
     * @return the ID of the fuel station, or null if not found
     */
    @Query("SELECT fs.id FROM FuelStation fs WHERE fs.owner = :owner")
    Long findIdByOwner(StationOwner owner);

    /**
     * Find station details by user email using a native query to avoid lazy loading issues
     *
     * @param email the user email
     * @return a list of arrays containing station details
     */
    @Query(value = """
            SELECT
                fs.id,
                fs.station_name,
                fs.business_registration_number,
                fs.business_address,
                fs.opening_time,
                fs.closing_time,
                fs.verification_status,
                so.id as owner_id,
                so.full_name,
                so.contact_number,
                so.nic_number
            FROM
                fuel_stations fs
            JOIN
                station_owners so ON fs.owner_id = so.id
            JOIN
                users u ON so.user_id = u.id
            WHERE
                u.email = ?1
            LIMIT 1
            """,
            nativeQuery = true)
    List<Object[]> findStationDetailsByUserEmail(String email);

    /**
     * Find station fuel types by station ID using a native query to avoid lazy loading issues
     *
     * @param stationId the station ID
     * @return a list of arrays containing fuel type details
     */
    @Query(value = """
            SELECT
                sft.fuel_type,
                sft.is_available,
                sft.unit_price
            FROM
                station_fuel_types sft
            WHERE
                sft.station_id = ?1
            """,
            nativeQuery = true)
    List<Object[]> findStationFuelTypesByStationId(Long stationId);
}
