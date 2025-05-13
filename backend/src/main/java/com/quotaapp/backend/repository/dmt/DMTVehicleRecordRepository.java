package com.quotaapp.backend.repository.dmt;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.dmt.DMTVehicleRecord;

@Repository
public interface DMTVehicleRecordRepository extends JpaRepository<DMTVehicleRecord, Integer> {

    /**
     * Find a vehicle record by registration number
     *
     * @param registrationNumber the registration number to search for
     * @return an Optional containing the vehicle record if found
     */
    Optional<DMTVehicleRecord> findByRegistrationNumber(String registrationNumber);

    /**
     * Find a vehicle record by chassis number
     *
     * @param chassisNumber the chassis number to search for
     * @return an Optional containing the vehicle record if found
     */
    Optional<DMTVehicleRecord> findByChassisNumber(String chassisNumber);

    /**
     * Find a vehicle record by engine number
     *
     * @param engineNumber the engine number to search for
     * @return an Optional containing the vehicle record if found
     */
    Optional<DMTVehicleRecord> findByEngineNumber(String engineNumber);

    /**
     * Find a vehicle record by registration number and owner NIC
     *
     * @param registrationNumber the registration number to search for
     * @param ownerNic the owner NIC to search for
     * @return an Optional containing the vehicle record if found
     */
    Optional<DMTVehicleRecord> findByRegistrationNumberAndOwnerNic(String registrationNumber, String ownerNic);
}
