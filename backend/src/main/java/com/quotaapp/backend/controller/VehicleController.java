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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.dto.quota.QuotaAllocationDTO;
import com.quotaapp.backend.dto.signup.DMTValidationDTO;
import com.quotaapp.backend.dto.signup.VehicleInfoDTO;
import com.quotaapp.backend.model.FuelQuota;
import com.quotaapp.backend.model.FuelType;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.model.Vehicle;
import com.quotaapp.backend.model.VehicleClass;
import com.quotaapp.backend.model.VehicleOwner;
import com.quotaapp.backend.repository.primary.FuelQuotaRepository;
import com.quotaapp.backend.repository.primary.UserRepository;
import com.quotaapp.backend.repository.primary.VehicleClassRepository;
import com.quotaapp.backend.repository.primary.VehicleOwnerRepository;
import com.quotaapp.backend.repository.primary.VehicleRepository;
import com.quotaapp.backend.service.DMTValidationService;
import com.quotaapp.backend.service.FuelQuotaService;

import jakarta.validation.Valid;
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
    private final FuelQuotaRepository fuelQuotaRepository;
    private final VehicleClassRepository vehicleClassRepository;
    private final DMTValidationService dmtValidationService;
    private final FuelQuotaService fuelQuotaService;

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

            // Get the current quota from the FuelQuotaService
            Optional<FuelQuota> currentQuotaOpt = fuelQuotaRepository.findCurrentQuotaByVehicleId(vehicle.getId(), LocalDate.now());

            // Default quota amount from vehicle class
            BigDecimal totalQuota = vehicle.getVehicleClass().getFuelQuotaAmount();
            BigDecimal remainingQuota = BigDecimal.ZERO;
            LocalDate lastUpdated = LocalDate.now();
            LocalDate expiryDate = LocalDate.now().plusDays(30); // Default expiry

            if (currentQuotaOpt.isPresent()) {
                FuelQuota currentQuota = currentQuotaOpt.get();
                totalQuota = currentQuota.getAllocatedAmount();
                remainingQuota = currentQuota.getRemainingAmount();
                lastUpdated = currentQuota.getUpdatedAt() != null ?
                    currentQuota.getUpdatedAt().toLocalDate() : currentQuota.getAllocationDate();
                expiryDate = currentQuota.getExpiryDate();
            }

            quotaData.put("totalQuota", totalQuota);
            quotaData.put("remainingQuota", remainingQuota);
            quotaData.put("quotaUnit", "liters");
            quotaData.put("lastUpdated", lastUpdated.format(DateTimeFormatter.ISO_DATE));
            quotaData.put("nextRefill", expiryDate.format(DateTimeFormatter.ISO_DATE));

            vehicleData.put("quota", quotaData);

            vehiclesList.add(vehicleData);
        }

        return ResponseEntity.ok(ApiResponse.success("Vehicles retrieved successfully", vehiclesList));
    }

    /**
     * Add a new vehicle to the authenticated user
     *
     * @param vehicleInfoDTO the vehicle information
     * @return the response
     */
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addVehicle(@Valid @RequestBody VehicleInfoDTO vehicleInfoDTO) {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Adding new vehicle for user: {}, registration: {}", email, vehicleInfoDTO.getRegistrationNumber());

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
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Only vehicle owners can add vehicles."));
        }

        // Find the vehicle owner
        Optional<VehicleOwner> ownerOpt = vehicleOwnerRepository.findByUser(user);

        if (ownerOpt.isEmpty()) {
            log.warn("Vehicle owner not found for user: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("Vehicle owner not found"));
        }

        VehicleOwner owner = ownerOpt.get();

        try {
            // Check if vehicle registration number already exists
            Optional<Vehicle> existingVehicle = vehicleRepository.findByRegistrationNumber(vehicleInfoDTO.getRegistrationNumber());
            if (existingVehicle.isPresent()) {
                log.warn("Vehicle with registration number {} already exists", vehicleInfoDTO.getRegistrationNumber());
                return ResponseEntity.badRequest().body(ApiResponse.error("Vehicle with this registration number already exists"));
            }

            // Validate vehicle with DMT
            List<String> validationErrors = dmtValidationService.validateVehicleInformation(
                DMTValidationDTO.builder()
                    .registrationNumber(vehicleInfoDTO.getRegistrationNumber())
                    .engineNumber(vehicleInfoDTO.getEngineNumber())
                    .chassisNumber(vehicleInfoDTO.getChassisNumber())
                    .ownerNIC(owner.getNicNumber())
                    .ownerName(owner.getFullName())
                    .build()
            );

            if (!validationErrors.isEmpty()) {
                log.warn("DMT validation failed for vehicle: {}", vehicleInfoDTO.getRegistrationNumber());
                return ResponseEntity.badRequest().body(ApiResponse.error("Vehicle validation failed. " + String.join(", ", validationErrors)));
            }

            // Extract vehicle class code from the full vehicle class string
            String vehicleClassCode = extractVehicleClassCode(vehicleInfoDTO.getVehicleClass());

            // Find the vehicle class
            Optional<VehicleClass> vehicleClassOpt = vehicleClassRepository.findByCode(vehicleClassCode);
            if (vehicleClassOpt.isEmpty()) {
                log.warn("Vehicle class not found: {}", vehicleClassCode);
                return ResponseEntity.badRequest().body(ApiResponse.error("Invalid vehicle class"));
            }

            VehicleClass vehicleClass = vehicleClassOpt.get();

            // Parse fuel type
            FuelType fuelType;
            try {
                fuelType = FuelType.fromDisplayName(vehicleInfoDTO.getFuelType());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid fuel type: {}", vehicleInfoDTO.getFuelType());
                return ResponseEntity.badRequest().body(ApiResponse.error("Invalid fuel type"));
            }

            // Create the new vehicle
            Vehicle vehicle = Vehicle.builder()
                .owner(owner)
                .registrationNumber(vehicleInfoDTO.getRegistrationNumber())
                .engineNumber(vehicleInfoDTO.getEngineNumber())
                .chassisNumber(vehicleInfoDTO.getChassisNumber())
                .make(vehicleInfoDTO.getMake())
                .model(vehicleInfoDTO.getModel())
                .yearOfManufacture(vehicleInfoDTO.getYearOfManufacture())
                .vehicleClass(vehicleClass)
                .typeOfBody(vehicleInfoDTO.getTypeOfBody())
                .fuelType(fuelType)
                .engineCapacity(vehicleInfoDTO.getEngineCapacity())
                .color(vehicleInfoDTO.getColor())
                .grossVehicleWeight(vehicleInfoDTO.getGrossVehicleWeight())
                .dateOfFirstRegistration(vehicleInfoDTO.getDateOfFirstRegistration())
                .countryOfOrigin(vehicleInfoDTO.getCountryOfOrigin())
                .isActive(true)
                .build();

            // Save the vehicle
            Vehicle savedVehicle = vehicleRepository.save(vehicle);

            // Initialize fuel quota for the new vehicle
            QuotaAllocationDTO quotaAllocation = QuotaAllocationDTO.builder()
                .vehicleId(savedVehicle.getId())
                .allocatedAmount(vehicleClass.getFuelQuotaAmount())
                .allocationDate(LocalDate.now())
                .expiryDate(LocalDate.now().plusDays(30)) // Default 30-day expiry
                .build();

            fuelQuotaService.allocateQuota(quotaAllocation);

            log.info("Successfully added vehicle: {} for user: {}", savedVehicle.getRegistrationNumber(), email);

            // Prepare response data
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("vehicleId", savedVehicle.getId());
            responseData.put("registrationNumber", savedVehicle.getRegistrationNumber());
            responseData.put("message", "Vehicle added successfully");

            return ResponseEntity.ok(ApiResponse.success("Vehicle added successfully", responseData));

        } catch (Exception e) {
            log.error("Error adding vehicle for user: {}", email, e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to add vehicle. Please try again."));
        }
    }

    /**
     * Extract vehicle class code from the full vehicle class string
     * Example: "A1: Light motor cycles" -> "A1"
     */
    private String extractVehicleClassCode(String vehicleClassFull) {
        if (vehicleClassFull == null || vehicleClassFull.trim().isEmpty()) {
            return "";
        }

        // Split by colon and take the first part, then trim
        String[] parts = vehicleClassFull.split(":");
        return parts[0].trim();
    }
}
