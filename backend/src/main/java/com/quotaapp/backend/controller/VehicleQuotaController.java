package com.quotaapp.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.dto.quota.QuotaDetailsDTO;
import com.quotaapp.backend.dto.transaction.TransactionDetailsDTO;
import com.quotaapp.backend.exception.ResourceNotFoundException;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.model.Vehicle;
import com.quotaapp.backend.model.VehicleOwner;
import com.quotaapp.backend.repository.primary.UserRepository;
import com.quotaapp.backend.repository.primary.VehicleOwnerRepository;
import com.quotaapp.backend.repository.primary.VehicleRepository;
import com.quotaapp.backend.service.FuelQuotaService;
import com.quotaapp.backend.service.FuelTransactionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for vehicle quota-related endpoints
 */
@RestController
@RequestMapping("/api/quota")
@RequiredArgsConstructor
@Slf4j
public class VehicleQuotaController {

    private final UserRepository userRepository;
    private final VehicleOwnerRepository vehicleOwnerRepository;
    private final VehicleRepository vehicleRepository;
    private final FuelQuotaService fuelQuotaService;
    private final FuelTransactionService fuelTransactionService;
    
    /**
     * Get quota details for the authenticated user's vehicles
     * 
     * @return the quota details
     */
    @GetMapping("/details")
    public ResponseEntity<ApiResponse<List<QuotaDetailsDTO>>> getQuotaDetails() {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        log.info("Fetching quota details for user: {}", email);
        
        // Find the user in the database
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }
        
        User user = userOpt.get();
        
        // Verify that the user is a vehicle owner
        if (!user.getRole().name().equals("VEHICLE_OWNER")) {
            log.warn("User is not a vehicle owner: {}", email);
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Vehicle owner privileges required."));
        }
        
        // Find the vehicle owner details
        Optional<VehicleOwner> vehicleOwnerOpt = vehicleOwnerRepository.findByUser(user);
        
        if (vehicleOwnerOpt.isEmpty()) {
            log.warn("Vehicle owner details not found for user: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("Vehicle owner details not found"));
        }
        
        VehicleOwner vehicleOwner = vehicleOwnerOpt.get();
        
        // Get all vehicles for the owner
        List<Vehicle> vehicles = vehicleRepository.findByOwner(vehicleOwner);
        
        if (vehicles.isEmpty()) {
            log.info("No vehicles found for owner: {}", vehicleOwner.getId());
            return ResponseEntity.ok(ApiResponse.success("No vehicles found", List.of()));
        }
        
        // Get quota details for each vehicle
        List<QuotaDetailsDTO> quotaDetailsList = vehicles.stream()
                .map(vehicle -> fuelQuotaService.getQuotaDetails(vehicle.getId()))
                .toList();
        
        return ResponseEntity.ok(ApiResponse.success("Quota details retrieved successfully", quotaDetailsList));
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
        
        // Find the vehicle
        Optional<Vehicle> vehicleOpt = vehicleRepository.findById(vehicleId);
        
        if (vehicleOpt.isEmpty()) {
            log.warn("Vehicle not found with ID: {}", vehicleId);
            return ResponseEntity.status(404).body(ApiResponse.error("Vehicle not found"));
        }
        
        Vehicle vehicle = vehicleOpt.get();
        
        // Check if the user is the owner of the vehicle or an admin
        boolean isOwner = vehicle.getOwner().getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        
        if (!isOwner && !isAdmin) {
            log.warn("User {} is not authorized to access vehicle {}", email, vehicleId);
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied. You are not authorized to access this vehicle."));
        }
        
        // Get quota details for the vehicle
        QuotaDetailsDTO quotaDetails = fuelQuotaService.getQuotaDetails(vehicleId);
        
        return ResponseEntity.ok(ApiResponse.success("Quota details retrieved successfully", quotaDetails));
    }
    
    /**
     * Get consumption history for the authenticated user's vehicles
     * 
     * @param page the page number (0-based)
     * @param size the page size
     * @return the consumption history
     */
    @GetMapping("/consumption/history")
    public ResponseEntity<ApiResponse<Page<TransactionDetailsDTO>>> getConsumptionHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        log.info("Fetching consumption history for user: {}", email);
        
        // Find the user in the database
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }
        
        User user = userOpt.get();
        
        // Verify that the user is a vehicle owner
        if (!user.getRole().name().equals("VEHICLE_OWNER")) {
            log.warn("User is not a vehicle owner: {}", email);
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Vehicle owner privileges required."));
        }
        
        // Find the vehicle owner details
        Optional<VehicleOwner> vehicleOwnerOpt = vehicleOwnerRepository.findByUser(user);
        
        if (vehicleOwnerOpt.isEmpty()) {
            log.warn("Vehicle owner details not found for user: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("Vehicle owner details not found"));
        }
        
        VehicleOwner vehicleOwner = vehicleOwnerOpt.get();
        
        // Get all vehicles for the owner
        List<Vehicle> vehicles = vehicleRepository.findByOwner(vehicleOwner);
        
        if (vehicles.isEmpty()) {
            log.info("No vehicles found for owner: {}", vehicleOwner.getId());
            return ResponseEntity.ok(ApiResponse.success("No vehicles found", Page.empty()));
        }
        
        // Get the first vehicle for now (in a real implementation, we would handle multiple vehicles)
        Vehicle vehicle = vehicles.get(0);
        
        // Create pageable with sorting by transaction date (descending)
        Pageable pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending());
        
        // Get consumption history for the vehicle
        Page<TransactionDetailsDTO> consumptionHistory = fuelTransactionService.getTransactionsByVehicleId(vehicle.getId(), pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Consumption history retrieved successfully", consumptionHistory));
    }
    
    /**
     * Get consumption history for a specific vehicle
     * 
     * @param vehicleId the vehicle ID
     * @param page the page number (0-based)
     * @param size the page size
     * @return the consumption history
     */
    @GetMapping("/consumption/history/{vehicleId}")
    public ResponseEntity<ApiResponse<Page<TransactionDetailsDTO>>> getConsumptionHistoryByVehicleId(
            @PathVariable Long vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        log.info("Fetching consumption history for vehicle ID: {} by user: {}", vehicleId, email);
        
        // Find the user in the database
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }
        
        User user = userOpt.get();
        
        // Find the vehicle
        Optional<Vehicle> vehicleOpt = vehicleRepository.findById(vehicleId);
        
        if (vehicleOpt.isEmpty()) {
            log.warn("Vehicle not found with ID: {}", vehicleId);
            return ResponseEntity.status(404).body(ApiResponse.error("Vehicle not found"));
        }
        
        Vehicle vehicle = vehicleOpt.get();
        
        // Check if the user is the owner of the vehicle or an admin
        boolean isOwner = vehicle.getOwner().getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        
        if (!isOwner && !isAdmin) {
            log.warn("User {} is not authorized to access vehicle {}", email, vehicleId);
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied. You are not authorized to access this vehicle."));
        }
        
        // Create pageable with sorting by transaction date (descending)
        Pageable pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending());
        
        // Get consumption history for the vehicle
        Page<TransactionDetailsDTO> consumptionHistory = fuelTransactionService.getTransactionsByVehicleId(vehicleId, pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Consumption history retrieved successfully", consumptionHistory));
    }
}
