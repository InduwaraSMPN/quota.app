package com.quotaapp.backend.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
import com.quotaapp.backend.dto.transaction.TransactionDetailsDTO;
import com.quotaapp.backend.service.FuelTransactionService;
import com.quotaapp.backend.exception.ResourceNotFoundException;
import com.quotaapp.backend.model.FuelTransaction;
import com.quotaapp.backend.model.FuelType;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.repository.primary.FuelTransactionRepository;
import com.quotaapp.backend.repository.primary.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for admin transaction management
 */
@RestController
@RequestMapping("/api/admin/transactions")
@RequiredArgsConstructor
@Slf4j
public class AdminTransactionController {

    private final FuelTransactionRepository fuelTransactionRepository;
    private final UserRepository userRepository;
    private final FuelTransactionService fuelTransactionService;

    /**
     * Get all transactions with pagination, sorting, and filtering
     *
     * @param page the page number (0-based)
     * @param size the page size
     * @param sort the sort field
     * @param direction the sort direction
     * @param vehicleId the vehicle ID filter
     * @param stationId the station ID filter
     * @param startDate the start date filter
     * @param endDate the end date filter
     * @param fuelType the fuel type filter
     * @return a page of transactions
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "transactionDate") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) Long vehicleId,
            @RequestParam(required = false) Long stationId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String fuelType) {

        log.info("Getting all transactions with pagination: page={}, size={}, sort={}, direction={}, vehicleId={}, stationId={}, startDate={}, endDate={}, fuelType={}",
                page, size, sort, direction, vehicleId, stationId, startDate, endDate, fuelType);

        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("User: {} is requesting transactions", email);

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
            // Create pageable object for pagination and sorting
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));

            // Parse dates if provided
            LocalDateTime startDateTime = null;
            LocalDateTime endDateTime = null;

            if (startDate != null && !startDate.isEmpty()) {
                startDateTime = LocalDate.parse(startDate, DateTimeFormatter.ISO_DATE).atStartOfDay();
            }

            if (endDate != null && !endDate.isEmpty()) {
                endDateTime = LocalDate.parse(endDate, DateTimeFormatter.ISO_DATE).plusDays(1).atStartOfDay();
            }

            // Parse fuel type if provided
            FuelType fuelTypeEnum = null;
            if (fuelType != null && !fuelType.isEmpty()) {
                try {
                    fuelTypeEnum = FuelType.valueOf(fuelType);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid fuel type: {}", fuelType);
                    return ResponseEntity.badRequest().body(ApiResponse.error("Invalid fuel type"));
                }
            }

            // Get transactions with filtering
            Page<FuelTransaction> transactionsPage;

            if (vehicleId != null) {
                // Filter by vehicle ID
                if (startDateTime != null && endDateTime != null) {
                    // Filter by vehicle ID and date range
                    if (fuelTypeEnum != null) {
                        // Filter by vehicle ID, date range, and fuel type
                        transactionsPage = fuelTransactionRepository.findByVehicleIdAndTransactionDateBetweenAndFuelType(
                                vehicleId, startDateTime, endDateTime, fuelTypeEnum, pageable);
                    } else {
                        // Filter by vehicle ID and date range
                        transactionsPage = fuelTransactionRepository.findByVehicleIdAndTransactionDateBetween(
                                vehicleId, startDateTime, endDateTime, pageable);
                    }
                } else {
                    // Filter by vehicle ID only
                    if (fuelTypeEnum != null) {
                        // Filter by vehicle ID and fuel type
                        transactionsPage = fuelTransactionRepository.findByVehicleIdAndFuelType(
                                vehicleId, fuelTypeEnum, pageable);
                    } else {
                        // Filter by vehicle ID only
                        transactionsPage = fuelTransactionRepository.findByVehicleId(vehicleId, pageable);
                    }
                }
            } else if (stationId != null) {
                // Filter by station ID
                if (startDateTime != null && endDateTime != null) {
                    // Filter by station ID and date range
                    if (fuelTypeEnum != null) {
                        // Filter by station ID, date range, and fuel type
                        transactionsPage = fuelTransactionRepository.findByStationIdAndTransactionDateBetweenAndFuelType(
                                stationId, startDateTime, endDateTime, fuelTypeEnum, pageable);
                    } else {
                        // Filter by station ID and date range
                        transactionsPage = fuelTransactionRepository.findByStationIdAndTransactionDateBetween(
                                stationId, startDateTime, endDateTime, pageable);
                    }
                } else {
                    // Filter by station ID only
                    if (fuelTypeEnum != null) {
                        // Filter by station ID and fuel type
                        transactionsPage = fuelTransactionRepository.findByStationIdAndFuelType(
                                stationId, fuelTypeEnum, pageable);
                    } else {
                        // Filter by station ID only
                        transactionsPage = fuelTransactionRepository.findByStationId(stationId, pageable);
                    }
                }
            } else if (startDateTime != null && endDateTime != null) {
                // Filter by date range
                if (fuelTypeEnum != null) {
                    // Filter by date range and fuel type
                    transactionsPage = fuelTransactionRepository.findByTransactionDateBetweenAndFuelType(
                            startDateTime, endDateTime, fuelTypeEnum, pageable);
                } else {
                    // Filter by date range only
                    transactionsPage = fuelTransactionRepository.findByTransactionDateBetween(
                            startDateTime, endDateTime, pageable);
                }
            } else if (fuelTypeEnum != null) {
                // Filter by fuel type only
                transactionsPage = fuelTransactionRepository.findByFuelType(fuelTypeEnum, pageable);
            } else {
                // No filters, get all transactions
                transactionsPage = fuelTransactionRepository.findAll(pageable);
            }

            // Convert transactions to DTOs
            List<TransactionDetailsDTO> transactions = transactionsPage.getContent().stream()
                    .map(transaction -> TransactionDetailsDTO.builder()
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
                            .build())
                    .collect(Collectors.toList());

            // Create response with pagination information
            Map<String, Object> response = new HashMap<>();
            response.put("transactions", transactions);
            response.put("currentPage", transactionsPage.getNumber());
            response.put("totalItems", transactionsPage.getTotalElements());
            response.put("totalPages", transactionsPage.getTotalPages());

            return ResponseEntity.ok(ApiResponse.success("Transactions retrieved successfully", response));
        } catch (Exception e) {
            log.error("Error getting transactions", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Error getting transactions: " + e.getMessage()));
        }
    }

    /**
     * Get transaction details by ID
     *
     * @param id the transaction ID
     * @return the transaction details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionDetailsDTO>> getTransactionById(@PathVariable Long id) {
        log.info("Getting transaction with ID: {}", id);

        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("User: {} is requesting transaction details", email);

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
            // Get transaction details using the service
            TransactionDetailsDTO transactionDetails = fuelTransactionService.getTransactionById(id);

            return ResponseEntity.ok(ApiResponse.success("Transaction retrieved successfully", transactionDetails));
        } catch (ResourceNotFoundException e) {
            log.error("Transaction not found", e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting transaction", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Error getting transaction: " + e.getMessage()));
        }
    }

    /**
     * Get recent transactions
     *
     * @param limit the maximum number of transactions to return
     * @return a list of recent transactions
     */
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<TransactionDetailsDTO>>> getRecentTransactions(
            @RequestParam(defaultValue = "10") int limit) {

        log.info("Getting recent transactions with limit: {}", limit);

        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("User: {} is requesting recent transactions", email);

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
            // Get recent transactions
            Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "transactionDate"));
            Page<FuelTransaction> transactionsPage = fuelTransactionRepository.findAll(pageable);

            // Convert transactions to DTOs
            List<TransactionDetailsDTO> transactions = transactionsPage.getContent().stream()
                    .map(transaction -> TransactionDetailsDTO.builder()
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
                            .build())
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("Recent transactions retrieved successfully", transactions));
        } catch (Exception e) {
            log.error("Error getting recent transactions", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Error getting recent transactions: " + e.getMessage()));
        }
    }

    /**
     * Get transaction statistics
     *
     * @param startDate the start date filter
     * @param endDate the end date filter
     * @return the transaction statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTransactionStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        log.info("Getting transaction statistics: startDate={}, endDate={}", startDate, endDate);

        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("User: {} is requesting transaction statistics", email);

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
            // Parse dates if provided
            LocalDateTime startDateTime = null;
            LocalDateTime endDateTime = null;

            if (startDate != null && !startDate.isEmpty()) {
                startDateTime = LocalDate.parse(startDate, DateTimeFormatter.ISO_DATE).atStartOfDay();
            } else {
                // Default to 30 days ago
                startDateTime = LocalDateTime.now().minusDays(30);
            }

            if (endDate != null && !endDate.isEmpty()) {
                endDateTime = LocalDate.parse(endDate, DateTimeFormatter.ISO_DATE).plusDays(1).atStartOfDay();
            } else {
                // Default to now
                endDateTime = LocalDateTime.now();
            }

            // Get transactions for the date range
            List<FuelTransaction> transactions = fuelTransactionRepository.findByTransactionDateBetween(
                    startDateTime, endDateTime);

            // Calculate statistics
            Map<String, Object> stats = new HashMap<>();

            // Total transactions
            stats.put("totalTransactions", transactions.size());

            // Total fuel dispensed
            double totalFuelDispensed = transactions.stream()
                    .mapToDouble(t -> t.getAmount().doubleValue())
                    .sum();
            stats.put("totalFuelDispensed", totalFuelDispensed);

            // Total revenue
            double totalRevenue = transactions.stream()
                    .mapToDouble(t -> t.getTotalPrice().doubleValue())
                    .sum();
            stats.put("totalRevenue", totalRevenue);

            // Transactions by fuel type
            Map<String, Long> transactionsByFuelType = transactions.stream()
                    .collect(Collectors.groupingBy(t -> t.getFuelType().toString(), Collectors.counting()));
            stats.put("transactionsByFuelType", transactionsByFuelType);

            // Fuel dispensed by fuel type
            Map<String, Double> fuelDispensedByFuelType = transactions.stream()
                    .collect(Collectors.groupingBy(
                            t -> t.getFuelType().toString(),
                            Collectors.summingDouble(t -> t.getAmount().doubleValue())));
            stats.put("fuelDispensedByFuelType", fuelDispensedByFuelType);

            // Revenue by fuel type
            Map<String, Double> revenueByFuelType = transactions.stream()
                    .collect(Collectors.groupingBy(
                            t -> t.getFuelType().toString(),
                            Collectors.summingDouble(t -> t.getTotalPrice().doubleValue())));
            stats.put("revenueByFuelType", revenueByFuelType);

            // Transactions by date
            Map<String, Long> transactionsByDate = transactions.stream()
                    .collect(Collectors.groupingBy(
                            t -> t.getTransactionDate().toLocalDate().toString(),
                            Collectors.counting()));
            stats.put("transactionsByDate", transactionsByDate);

            // Fuel dispensed by date
            Map<String, Double> fuelDispensedByDate = transactions.stream()
                    .collect(Collectors.groupingBy(
                            t -> t.getTransactionDate().toLocalDate().toString(),
                            Collectors.summingDouble(t -> t.getAmount().doubleValue())));
            stats.put("fuelDispensedByDate", fuelDispensedByDate);

            // Revenue by date
            Map<String, Double> revenueByDate = transactions.stream()
                    .collect(Collectors.groupingBy(
                            t -> t.getTransactionDate().toLocalDate().toString(),
                            Collectors.summingDouble(t -> t.getTotalPrice().doubleValue())));
            stats.put("revenueByDate", revenueByDate);

            return ResponseEntity.ok(ApiResponse.success("Transaction statistics retrieved successfully", stats));
        } catch (Exception e) {
            log.error("Error getting transaction statistics", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Error getting transaction statistics: " + e.getMessage()));
        }
    }
}
