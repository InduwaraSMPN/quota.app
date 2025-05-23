package com.quotaapp.backend.repository.primary;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
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
}
