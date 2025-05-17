package com.quotaapp.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.model.Vehicle;
import com.quotaapp.backend.model.VehicleOwner;
import com.quotaapp.backend.repository.primary.UserRepository;
import com.quotaapp.backend.repository.primary.VehicleOwnerRepository;
import com.quotaapp.backend.repository.primary.VehicleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for vehicle-related endpoints
 */
@RestController
@RequestMapping("/api/vehicle")
@RequiredArgsConstructor
@Slf4j
public class VehicleController {

    private final UserRepository userRepository;
    private final VehicleOwnerRepository vehicleOwnerRepository;
    private final VehicleRepository vehicleRepository;

    /**
     * Get vehicles for the authenticated user
     *
     * @return the vehicles
     */
    @GetMapping("/details")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getVehicleDetails() {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Fetching vehicles for user: {}", email);

        // Find the user in the database
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }

        User user = userOpt.get();

        // Check if the user is a vehicle owner
        if (!user.getRole().name().equals("VEHICLE_OWNER")) {
            log.warn("User is not a vehicle owner: {}", email);
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Only vehicle owners can access this endpoint."));
        }

        // Find the vehicle owner
        Optional<VehicleOwner> ownerOpt = vehicleOwnerRepository.findByUser(user);

        if (ownerOpt.isEmpty()) {
            log.warn("Vehicle owner not found for user: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("Vehicle owner not found"));
        }

        VehicleOwner owner = ownerOpt.get();

        // Find all vehicles for the owner
        List<Vehicle> vehicles = vehicleRepository.findByOwner(owner);

        // Create the response data
        List<Map<String, Object>> vehiclesList = new ArrayList<>();

        for (Vehicle vehicle : vehicles) {
            Map<String, Object> vehicleData = new HashMap<>();
            vehicleData.put("id", vehicle.getId().toString());
            vehicleData.put("ownerId", owner.getId().toString());  // Add the owner ID
            vehicleData.put("registrationNumber", vehicle.getRegistrationNumber());
            vehicleData.put("engineNumber", vehicle.getEngineNumber());
            vehicleData.put("chassisNumber", vehicle.getChassisNumber());
            vehicleData.put("make", vehicle.getMake());
            vehicleData.put("model", vehicle.getModel());
            vehicleData.put("yearOfManufacture", vehicle.getYearOfManufacture().toString());
            vehicleData.put("vehicleClass", vehicle.getVehicleClass().getCode());
            vehicleData.put("typeOfBody", vehicle.getTypeOfBody());
            vehicleData.put("fuelType", vehicle.getFuelType().getDisplayName());
            vehicleData.put("engineCapacity", vehicle.getEngineCapacity().toString());
            vehicleData.put("color", vehicle.getColor());
            vehicleData.put("dateOfFirstRegistration", vehicle.getDateOfFirstRegistration().format(DateTimeFormatter.ISO_DATE));

            // Add quota information
            Map<String, Object> quotaData = new HashMap<>();

            // For now, we'll use the vehicle class's fuel quota amount as the total quota
            BigDecimal totalQuota = vehicle.getVehicleClass().getFuelQuotaAmount();

            // Mock remaining quota (in a real implementation, this would come from the fuel_quotas table)
            BigDecimal remainingQuota = totalQuota.multiply(new BigDecimal("0.75")); // 75% of total quota

            quotaData.put("totalQuota", totalQuota);
            quotaData.put("remainingQuota", remainingQuota);
            quotaData.put("quotaUnit", "liters");
            quotaData.put("lastUpdated", LocalDate.now().minusDays(5).format(DateTimeFormatter.ISO_DATE));
            quotaData.put("nextRefill", LocalDate.now().plusDays(10).format(DateTimeFormatter.ISO_DATE));

            vehicleData.put("quota", quotaData);

            vehiclesList.add(vehicleData);
        }

        return ResponseEntity.ok(ApiResponse.success("Vehicles retrieved successfully", vehiclesList));
    }
}
