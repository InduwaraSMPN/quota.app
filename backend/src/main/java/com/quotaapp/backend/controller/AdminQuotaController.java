package com.quotaapp.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.dto.quota.QuotaAllocationDTO;
import com.quotaapp.backend.dto.quota.QuotaDetailsDTO;
import com.quotaapp.backend.dto.quota.QuotaHistoryDTO;
import com.quotaapp.backend.dto.quota.QuotaUpdateDTO;
import com.quotaapp.backend.dto.quota.VehicleClassQuotaDTO;
import com.quotaapp.backend.exception.ResourceNotFoundException;
import com.quotaapp.backend.model.FuelQuota;
import com.quotaapp.backend.model.QuotaHistory;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.model.Vehicle;
import com.quotaapp.backend.model.VehicleClass;
import com.quotaapp.backend.repository.primary.FuelQuotaRepository;
import com.quotaapp.backend.repository.primary.QuotaHistoryRepository;
import com.quotaapp.backend.repository.primary.UserRepository;
import com.quotaapp.backend.repository.primary.VehicleClassRepository;
import com.quotaapp.backend.repository.primary.VehicleRepository;
import com.quotaapp.backend.service.FuelQuotaService;
import com.quotaapp.backend.service.NotificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for admin quota-related endpoints
 */
@RestController
@RequestMapping("/api/admin/quota")
@RequiredArgsConstructor
@Slf4j
public class AdminQuotaController {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleClassRepository vehicleClassRepository;
    private final FuelQuotaService fuelQuotaService;
    private final FuelQuotaRepository fuelQuotaRepository;
    private final QuotaHistoryRepository quotaHistoryRepository;
    private final NotificationService notificationService;

    /**
     * Get all vehicle classes with their quota amounts
     *
     * @return the vehicle classes
     */
    @GetMapping("/vehicle-classes")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getVehicleClasses() {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Fetching vehicle classes by user: {}", email);

        // Find the user in the database
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }

        User user = userOpt.get();

        // Verify that the user is an admin
        if (!user.getRole().name().equals("ADMIN")) {
            log.warn("User is not an admin: {}", email);
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Admin privileges required."));
        }

        // Get all vehicle classes
        List<VehicleClass> vehicleClasses = vehicleClassRepository.findAll();

        // Map to response format
        List<Map<String, Object>> response = vehicleClasses.stream()
                .map(vehicleClass -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", vehicleClass.getId());
                    map.put("code", vehicleClass.getCode());
                    map.put("name", vehicleClass.getName());
                    map.put("description", vehicleClass.getDescription());
                    map.put("fuelQuotaAmount", vehicleClass.getFuelQuotaAmount());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Vehicle classes retrieved successfully", response));
    }

    /**
     * Update the quota amount for a vehicle class
     *
     * @param vehicleClassId the vehicle class ID
     * @param requestBody the request body containing the new quota amount
     * @return the updated vehicle class
     */
    @PutMapping("/vehicle-classes/{vehicleClassId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateVehicleClassQuota(
            @PathVariable Long vehicleClassId,
            @RequestBody Map<String, Object> requestBody) {

        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Updating quota amount for vehicle class ID: {} by user: {}", vehicleClassId, email);

        // Find the user in the database
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }

        User user = userOpt.get();

        // Verify that the user is an admin
        if (!user.getRole().name().equals("ADMIN")) {
            log.warn("User is not an admin: {}", email);
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Admin privileges required."));
        }

        // Validate request body
        if (!requestBody.containsKey("fuelQuotaAmount")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Fuel quota amount is required"));
        }

        BigDecimal fuelQuotaAmount;
        try {
            fuelQuotaAmount = new BigDecimal(requestBody.get("fuelQuotaAmount").toString());

            if (fuelQuotaAmount.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Fuel quota amount must be greater than 0"));
            }
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid fuel quota amount"));
        }

        // Find the vehicle class
        Optional<VehicleClass> vehicleClassOpt = vehicleClassRepository.findById(vehicleClassId);

        if (vehicleClassOpt.isEmpty()) {
            log.warn("Vehicle class not found with ID: {}", vehicleClassId);
            return ResponseEntity.status(404).body(ApiResponse.error("Vehicle class not found"));
        }

        VehicleClass vehicleClass = vehicleClassOpt.get();

        // Get the old quota amount for history
        BigDecimal oldQuotaAmount = vehicleClass.getFuelQuotaAmount();

        // Update the quota amount
        vehicleClass.setFuelQuotaAmount(fuelQuotaAmount);
        vehicleClass = vehicleClassRepository.save(vehicleClass);

        // Create quota history entry
        QuotaHistory quotaHistory = new QuotaHistory();
        quotaHistory.setVehicleClass(vehicleClass);
        quotaHistory.setOldQuotaAmount(oldQuotaAmount.doubleValue());
        quotaHistory.setNewQuotaAmount(fuelQuotaAmount.doubleValue());
        quotaHistory.setChangedBy(user.getEmail()); // Use admin email
        quotaHistory.setChangedAt(LocalDateTime.now());

        // Get reason if provided
        String reason = null;
        if (requestBody.containsKey("reason")) {
            reason = (String) requestBody.get("reason");
            quotaHistory.setReason(reason);
        }

        // Save quota history
        quotaHistoryRepository.save(quotaHistory);

        // Skip notifications for now as we need to implement a VehicleOwnerNotification model
        // and update the NotificationService to support vehicle owner notifications
        log.info("Quota updated for vehicle class: {}, new amount: {}", vehicleClass.getCode(), fuelQuotaAmount);

        // Map to response format
        Map<String, Object> response = new HashMap<>();
        response.put("id", vehicleClass.getId());
        response.put("code", vehicleClass.getCode());
        response.put("name", vehicleClass.getName());
        response.put("description", vehicleClass.getDescription());
        response.put("fuelQuotaAmount", vehicleClass.getFuelQuotaAmount());
        response.put("updatedAt", LocalDateTime.now());

        return ResponseEntity.ok(ApiResponse.success("Vehicle class quota updated successfully", response));
    }

    /**
     * Get quota change history
     *
     * @return a list of quota change history entries
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getQuotaHistory() {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Getting quota change history by user: {}", email);

        // Find the user in the database
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }

        User user = userOpt.get();

        // Verify that the user is an admin
        if (!user.getRole().name().equals("ADMIN")) {
            log.warn("User is not an admin: {}", email);
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Admin privileges required."));
        }

        try {
            List<QuotaHistory> quotaHistoryList = quotaHistoryRepository.findAllByOrderByChangedAtDesc();

            List<Map<String, Object>> result = quotaHistoryList.stream()
                    .map(history -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", history.getId());
                        map.put("vehicleClassId", history.getVehicleClass().getId());
                        map.put("vehicleClassCode", history.getVehicleClass().getCode());
                        map.put("vehicleClassName", history.getVehicleClass().getName());
                        map.put("oldQuotaAmount", history.getOldQuotaAmount());
                        map.put("newQuotaAmount", history.getNewQuotaAmount());
                        map.put("changedBy", history.getChangedBy());
                        map.put("changedAt", history.getChangedAt());
                        map.put("reason", history.getReason());
                        return map;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("Quota change history retrieved successfully", result));
        } catch (Exception e) {
            log.error("Error getting quota change history", e);
            return ResponseEntity.status(500).body(ApiResponse.error("Error getting quota change history: " + e.getMessage()));
        }
    }

    /**
     * Allocate a new quota for a vehicle
     *
     * @param quotaAllocation the quota allocation data
     * @return the created quota
     */
    @PostMapping("/allocate")
    public ResponseEntity<ApiResponse<QuotaDetailsDTO>> allocateQuota(@Valid @RequestBody QuotaAllocationDTO quotaAllocation) {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Allocating quota for vehicle ID: {} by user: {}", quotaAllocation.getVehicleId(), email);

        // Find the user in the database
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }

        User user = userOpt.get();

        // Verify that the user is an admin
        if (!user.getRole().name().equals("ADMIN")) {
            log.warn("User is not an admin: {}", email);
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Admin privileges required."));
        }

        try {
            // Allocate the quota
            fuelQuotaService.allocateQuota(quotaAllocation);

            // Get the updated quota details
            QuotaDetailsDTO quotaDetails = fuelQuotaService.getQuotaDetails(quotaAllocation.getVehicleId());

            return ResponseEntity.ok(ApiResponse.success("Quota allocated successfully", quotaDetails));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error allocating quota", e);
            return ResponseEntity.status(500).body(ApiResponse.error("An error occurred while allocating quota"));
        }
    }

    /**
     * Get quota details for a specific vehicle
     *
     * @param vehicleId the vehicle ID
     * @return the quota details
     */
    @GetMapping("/details/{vehicleId}")
    public ResponseEntity<ApiResponse<QuotaDetailsDTO>> getQuotaDetailsByVehicleId(@PathVariable Long vehicleId) {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Fetching quota details for vehicle ID: {} by user: {}", vehicleId, email);

        // Find the user in the database
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }

        User user = userOpt.get();

        // Verify that the user is an admin
        if (!user.getRole().name().equals("ADMIN")) {
            log.warn("User is not an admin: {}", email);
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Admin privileges required."));
        }

        try {
            // Get quota details for the vehicle
            QuotaDetailsDTO quotaDetails = fuelQuotaService.getQuotaDetails(vehicleId);

            return ResponseEntity.ok(ApiResponse.success("Quota details retrieved successfully", quotaDetails));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Allocate quotas for all vehicles of a specific class
     *
     * @param vehicleClassId the vehicle class ID
     * @param requestBody the request body containing the allocation details
     * @return the allocation result
     */
    @PostMapping("/allocate-by-class/{vehicleClassId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> allocateQuotasByVehicleClass(
            @PathVariable Long vehicleClassId,
            @RequestBody Map<String, Object> requestBody) {

        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Allocating quotas for vehicle class ID: {} by user: {}", vehicleClassId, email);

        // Find the user in the database
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }

        User user = userOpt.get();

        // Verify that the user is an admin
        if (!user.getRole().name().equals("ADMIN")) {
            log.warn("User is not an admin: {}", email);
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Admin privileges required."));
        }

        // Validate request body
        if (!requestBody.containsKey("allocationDate") || !requestBody.containsKey("expiryDate")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Allocation date and expiry date are required"));
        }

        LocalDate allocationDate;
        LocalDate expiryDate;

        try {
            allocationDate = LocalDate.parse(requestBody.get("allocationDate").toString());
            expiryDate = LocalDate.parse(requestBody.get("expiryDate").toString());

            if (allocationDate.isAfter(expiryDate)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Allocation date must be before or equal to expiry date"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid date format"));
        }

        // Find the vehicle class
        Optional<VehicleClass> vehicleClassOpt = vehicleClassRepository.findById(vehicleClassId);

        if (vehicleClassOpt.isEmpty()) {
            log.warn("Vehicle class not found with ID: {}", vehicleClassId);
            return ResponseEntity.status(404).body(ApiResponse.error("Vehicle class not found"));
        }

        VehicleClass vehicleClass = vehicleClassOpt.get();

        // Find all vehicles of the specified class
        List<Vehicle> vehicles = vehicleRepository.findByVehicleClass(vehicleClass);

        if (vehicles.isEmpty()) {
            log.info("No vehicles found for vehicle class: {}", vehicleClass.getCode());
            return ResponseEntity.ok(ApiResponse.success("No vehicles found for the specified class", Map.of(
                    "vehicleClass", vehicleClass.getCode(),
                    "vehiclesProcessed", 0,
                    "quotasAllocated", 0
            )));
        }

        // Allocate quotas for all vehicles
        int quotasAllocated = 0;

        for (Vehicle vehicle : vehicles) {
            try {
                QuotaAllocationDTO quotaAllocation = QuotaAllocationDTO.builder()
                        .vehicleId(vehicle.getId())
                        .allocatedAmount(vehicleClass.getFuelQuotaAmount())
                        .allocationDate(allocationDate)
                        .expiryDate(expiryDate)
                        .build();

                fuelQuotaService.allocateQuota(quotaAllocation);
                quotasAllocated++;
            } catch (Exception e) {
                log.error("Error allocating quota for vehicle ID: {}", vehicle.getId(), e);
                // Continue with the next vehicle
            }
        }

        // Map to response format
        Map<String, Object> response = new HashMap<>();
        response.put("vehicleClass", vehicleClass.getCode());
        response.put("vehiclesProcessed", vehicles.size());
        response.put("quotasAllocated", quotasAllocated);
        response.put("allocationDate", allocationDate);
        response.put("expiryDate", expiryDate);

        return ResponseEntity.ok(ApiResponse.success("Quotas allocated successfully", response));
    }
}
