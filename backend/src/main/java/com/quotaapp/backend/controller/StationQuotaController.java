package com.quotaapp.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.dto.quota.QuotaDetailsDTO;
import com.quotaapp.backend.dto.transaction.TransactionCreateDTO;
import com.quotaapp.backend.dto.transaction.TransactionDetailsDTO;
import com.quotaapp.backend.exception.InsufficientQuotaException;
import com.quotaapp.backend.exception.ResourceNotFoundException;
import com.quotaapp.backend.model.FuelStation;
import com.quotaapp.backend.model.FuelTransaction;
import com.quotaapp.backend.model.StationOwner;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.model.Vehicle;
import com.quotaapp.backend.repository.primary.FuelStationRepository;
import com.quotaapp.backend.repository.primary.StationOwnerRepository;
import com.quotaapp.backend.repository.primary.UserRepository;
import com.quotaapp.backend.repository.primary.VehicleRepository;
import com.quotaapp.backend.service.FuelQuotaService;
import com.quotaapp.backend.service.FuelTransactionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for station quota-related endpoints
 */
@RestController
@RequestMapping("/api/station/quota")
@RequiredArgsConstructor
@Slf4j
public class StationQuotaController {

    private final UserRepository userRepository;
    private final StationOwnerRepository stationOwnerRepository;
    private final FuelStationRepository fuelStationRepository;
    private final VehicleRepository vehicleRepository;
    private final FuelQuotaService fuelQuotaService;
    private final FuelTransactionService fuelTransactionService;

    /**
     * Get vehicle ID by registration number
     *
     * @param registrationNumber the vehicle registration number
     * @return the vehicle ID if found
     */
    @GetMapping("/vehicle/by-registration/{registrationNumber}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getVehicleByRegistrationNumber(@PathVariable String registrationNumber) {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Getting vehicle by registration number: {} by user: {}", registrationNumber, email);

        // Find the user in the database
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }

        User user = userOpt.get();

        // Verify that the user is a station owner or operator
        boolean isStationOwner = user.getRole().name().equals("STATION_OWNER");
        boolean isStationOperator = user.getRole().name().equals("STATION_OPERATOR");

        if (!isStationOwner && !isStationOperator) {
            log.warn("User is not a station owner or operator: {}", email);
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Station owner or operator privileges required."));
        }

        // Standardize registration number (remove hyphens and convert to uppercase)
        String standardizedRegNumber = registrationNumber.replaceAll("-", "").toUpperCase();

        // Find the vehicle by registration number
        Optional<Vehicle> vehicleOpt = vehicleRepository.findByRegistrationNumber(standardizedRegNumber);

        if (vehicleOpt.isEmpty()) {
            log.warn("Vehicle not found with registration number: {}", standardizedRegNumber);
            return ResponseEntity.status(404).body(ApiResponse.error("Vehicle not found"));
        }

        Vehicle vehicle = vehicleOpt.get();

        Map<String, Object> vehicleData = new HashMap<>();
        vehicleData.put("vehicleId", vehicle.getId());
        vehicleData.put("registrationNumber", vehicle.getRegistrationNumber());
        vehicleData.put("make", vehicle.getMake());
        vehicleData.put("model", vehicle.getModel());
        vehicleData.put("fuelType", vehicle.getFuelType());

        log.info("Vehicle found with ID: {} for registration number: {}", vehicle.getId(), standardizedRegNumber);
        return ResponseEntity.ok(ApiResponse.success("Vehicle found successfully", vehicleData));
    }

    /**
     * Validate a vehicle's quota
     *
     * @param vehicleId the vehicle ID
     * @return the validation result
     */
    @GetMapping("/validate/{vehicleId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateVehicleQuota(@PathVariable Long vehicleId) {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Validating quota for vehicle ID: {} by user: {}", vehicleId, email);

        // Find the user in the database
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }

        User user = userOpt.get();

        // Verify that the user is a station owner or operator
        boolean isStationOwner = user.getRole().name().equals("STATION_OWNER");
        boolean isStationOperator = user.getRole().name().equals("STATION_OPERATOR");

        if (!isStationOwner && !isStationOperator) {
            log.warn("User is not a station owner or operator: {}", email);
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Station owner or operator privileges required."));
        }

        // Find the vehicle
        Optional<Vehicle> vehicleOpt = vehicleRepository.findById(vehicleId);

        if (vehicleOpt.isEmpty()) {
            log.warn("Vehicle not found with ID: {}", vehicleId);
            return ResponseEntity.status(404).body(ApiResponse.error("Vehicle not found"));
        }

        Vehicle vehicle = vehicleOpt.get();

        try {
            // Get quota details for the vehicle
            QuotaDetailsDTO quotaDetails = fuelQuotaService.getQuotaDetails(vehicleId);

            Map<String, Object> validationResult = new HashMap<>();
            validationResult.put("vehicleId", vehicle.getId());
            validationResult.put("registrationNumber", vehicle.getRegistrationNumber());
            validationResult.put("make", vehicle.getMake());
            validationResult.put("model", vehicle.getModel());
            validationResult.put("fuelType", vehicle.getFuelType());
            validationResult.put("quotaDetails", quotaDetails);
            validationResult.put("isValid", quotaDetails.getQuotaStatus().equals("ACTIVE") &&
                    quotaDetails.getRemainingAmount().compareTo(java.math.BigDecimal.ZERO) > 0);

            return ResponseEntity.ok(ApiResponse.success("Vehicle quota validated successfully", validationResult));
        } catch (ResourceNotFoundException e) {
            Map<String, Object> validationResult = new HashMap<>();
            validationResult.put("vehicleId", vehicle.getId());
            validationResult.put("registrationNumber", vehicle.getRegistrationNumber());
            validationResult.put("make", vehicle.getMake());
            validationResult.put("model", vehicle.getModel());
            validationResult.put("fuelType", vehicle.getFuelType());
            validationResult.put("isValid", false);
            validationResult.put("message", "No active quota found for this vehicle");

            return ResponseEntity.ok(ApiResponse.success("Vehicle quota validation failed", validationResult));
        }
    }

    /**
     * Record a fuel transaction
     *
     * @param transactionCreate the transaction data
     * @return the created transaction
     */
    @PostMapping("/dispense")
    public ResponseEntity<ApiResponse<TransactionDetailsDTO>> dispenseFuel(@Valid @RequestBody TransactionCreateDTO transactionCreate) {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Recording fuel transaction for vehicle ID: {} by user: {}", transactionCreate.getVehicleId(), email);

        // Find the user in the database
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }

        User user = userOpt.get();

        // Verify that the user is a station owner or operator
        boolean isStationOwner = user.getRole().name().equals("STATION_OWNER");
        boolean isStationOperator = user.getRole().name().equals("STATION_OPERATOR");

        if (!isStationOwner && !isStationOperator) {
            log.warn("User is not a station owner or operator: {}", email);
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Station owner or operator privileges required."));
        }

        // If station owner, verify that the station belongs to the user
        if (isStationOwner) {
            Optional<StationOwner> stationOwnerOpt = stationOwnerRepository.findByUser(user);

            if (stationOwnerOpt.isEmpty()) {
                log.warn("Station owner details not found for user: {}", email);
                return ResponseEntity.status(404).body(ApiResponse.error("Station owner details not found"));
            }

            StationOwner stationOwner = stationOwnerOpt.get();

            Optional<FuelStation> stationOpt = fuelStationRepository.findById(transactionCreate.getStationId());

            if (stationOpt.isEmpty()) {
                log.warn("Fuel station not found with ID: {}", transactionCreate.getStationId());
                return ResponseEntity.status(404).body(ApiResponse.error("Fuel station not found"));
            }

            FuelStation station = stationOpt.get();

            if (!station.getOwner().getId().equals(stationOwner.getId())) {
                log.warn("User {} is not the owner of station {}", email, transactionCreate.getStationId());
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied. You are not the owner of this station."));
            }
        }

        // If station operator, verify that the operator is assigned to the station (not implemented yet)
        // Station operator validation will be implemented in a future update

        try {
            // Create the transaction
            FuelTransaction transaction = fuelTransactionService.createTransaction(transactionCreate);

            // Map to DTO
            TransactionDetailsDTO transactionDetails = TransactionDetailsDTO.builder()
                    .id(transaction.getId())
                    .vehicleId(transaction.getVehicle().getId())
                    .vehicleRegistrationNumber(transaction.getVehicle().getRegistrationNumber())
                    .stationId(transaction.getStation().getId())
                    .stationName(transaction.getStation().getStationName())
                    .fuelType(transaction.getFuelType())
                    .amount(transaction.getAmount())
                    .unitPrice(transaction.getUnitPrice())
                    .totalPrice(transaction.getTotalPrice())
                    .transactionDate(transaction.getTransactionDate())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Fuel dispensed successfully", transactionDetails));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        } catch (InsufficientQuotaException e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error dispensing fuel", e);
            return ResponseEntity.status(500).body(ApiResponse.error("An error occurred while dispensing fuel"));
        }
    }

    /**
     * Get transaction history for a station
     *
     * @param page the page number (0-based)
     * @param size the page size
     * @param startDate optional start date filter
     * @param endDate optional end date filter
     * @param fuelType optional fuel type filter
     * @return the transaction history
     */
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Page<TransactionDetailsDTO>>> getTransactionHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String fuelType) {

        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Fetching transaction history for user: {} with filters - startDate: {}, endDate: {}, fuelType: {}",
                email, startDate, endDate, fuelType);

        try {
            // Find the user in the database
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                log.warn("User not found: {}", email);
                return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
            }

            User user = userOpt.get();

            // Verify that the user is a station owner
            if (!user.getRole().name().equals("STATION_OWNER")) {
                log.warn("User is not a station owner: {}", email);
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Station owner privileges required."));
            }

            // Find the station owner details
            Optional<StationOwner> stationOwnerOpt = stationOwnerRepository.findByUser(user);

            if (stationOwnerOpt.isEmpty()) {
                log.warn("Station owner details not found for user: {}", email);
                return ResponseEntity.status(404).body(ApiResponse.error("Station owner details not found"));
            }

            StationOwner stationOwner = stationOwnerOpt.get();

            // Get the station ID directly instead of loading the full entity with collections
            Long stationId = fuelStationRepository.findIdByOwner(stationOwner);

            if (stationId == null) {
                log.warn("Fuel station not found for owner: {}", stationOwner.getId());
                return ResponseEntity.status(404).body(ApiResponse.error("Fuel station not found"));
            }

            // Create pageable with sorting by transaction date (descending)
            Pageable pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending());

            // Get transaction history for the station with filters
            Page<TransactionDetailsDTO> transactionHistory = fuelTransactionService.getTransactionsByStationId(
                    stationId,
                    startDate,
                    endDate,
                    fuelType,
                    pageable);

            return ResponseEntity.ok(ApiResponse.success("Transaction history retrieved successfully", transactionHistory));
        } catch (Exception e) {
            log.error("Error fetching transaction history: ", e);
            return ResponseEntity.status(500).body(ApiResponse.error("An error occurred while fetching transaction history"));
        }
    }

    /**
     * Get recent transactions for a station
     *
     * @param limit the maximum number of transactions to return
     * @return the recent transactions
     */
    @GetMapping("/transactions/recent")
    public ResponseEntity<ApiResponse<List<TransactionDetailsDTO>>> getRecentTransactions(
            @RequestParam(defaultValue = "5") int limit) {
        try {
            // Get the authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            log.info("Fetching recent transactions for user: {}", email);

            // Find the user in the database
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                log.warn("User not found: {}", email);
                return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
            }

            User user = userOpt.get();

            // Verify that the user is a station owner
            if (!user.getRole().name().equals("STATION_OWNER")) {
                log.warn("User is not a station owner: {}", email);
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Station owner privileges required."));
            }

            // Find the station owner details
            Optional<StationOwner> stationOwnerOpt = stationOwnerRepository.findByUser(user);

            if (stationOwnerOpt.isEmpty()) {
                log.warn("Station owner details not found for user: {}", email);
                return ResponseEntity.status(404).body(ApiResponse.error("Station owner details not found"));
            }

            StationOwner stationOwner = stationOwnerOpt.get();

            // Get the station ID directly to avoid loading the full entity with collections
            Long stationId = fuelStationRepository.findIdByOwner(stationOwner);

            if (stationId == null) {
                log.warn("Fuel station not found for owner: {}", stationOwner.getId());
                return ResponseEntity.status(404).body(ApiResponse.error("Fuel station not found"));
            }

            // Create pageable with sorting by transaction date (descending) and limit
            Pageable pageable = PageRequest.of(0, limit, Sort.by("transactionDate").descending());

            // Get recent transactions for the station
            Page<TransactionDetailsDTO> transactionsPage = fuelTransactionService.getTransactionsByStationId(stationId, pageable);
            List<TransactionDetailsDTO> recentTransactions = transactionsPage.getContent();

            return ResponseEntity.ok(ApiResponse.success("Recent transactions retrieved successfully", recentTransactions));
        } catch (Exception e) {
            log.error("Error fetching recent transactions", e);
            return ResponseEntity.status(500).body(ApiResponse.error("An error occurred while fetching recent transactions"));
        }
    }
}
