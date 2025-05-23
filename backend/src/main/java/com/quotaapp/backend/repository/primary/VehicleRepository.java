package com.quotaapp.backend.repository.primary;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.Vehicle;
import com.quotaapp.backend.model.VehicleOwner;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    /**
     * Find a vehicle by registration number
     *
     * @param registrationNumber the registration number to search for
     * @return an Optional containing the vehicle if found
     */
    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);

    /**
     * Find a vehicle by chassis number
     *
     * @param chassisNumber the chassis number to search for
     * @return an Optional containing the vehicle if found
     */
    Optional<Vehicle> findByChassisNumber(String chassisNumber);

    /**
     * Find a vehicle by engine number
     *
     * @param engineNumber the engine number to search for
     * @return an Optional containing the vehicle if found
     */
    Optional<Vehicle> findByEngineNumber(String engineNumber);

    /**
     * Find all vehicles by owner
     *
     * @param owner the owner to search for
     * @return a list of vehicles owned by the owner
     */
    List<Vehicle> findByOwner(VehicleOwner owner);

    /**
     * Check if a vehicle exists with the given registration number
     *
     * @param registrationNumber the registration number to check
     * @return true if a vehicle exists with the registration number, false otherwise
     */
    boolean existsByRegistrationNumber(String registrationNumber);

    /**
     * Check if a vehicle exists with the given chassis number
     *
     * @param chassisNumber the chassis number to check
     * @return true if a vehicle exists with the chassis number, false otherwise
     */
    boolean existsByChassisNumber(String chassisNumber);

    /**
     * Find all vehicles by vehicle class
     *
     * @param vehicleClass the vehicle class to search for
     * @return a list of vehicles with the specified vehicle class
     */
    List<Vehicle> findByVehicleClass(com.quotaapp.backend.model.VehicleClass vehicleClass);
}