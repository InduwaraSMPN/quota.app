package com.quotaapp.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.model.FuelTransaction;
import com.quotaapp.backend.model.FuelType;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.repository.primary.AdminUserRepository;
import com.quotaapp.backend.repository.primary.FuelQuotaRepository;
import com.quotaapp.backend.repository.primary.FuelStationRepository;
import com.quotaapp.backend.repository.primary.FuelTransactionRepository;
import com.quotaapp.backend.repository.primary.StationOwnerRepository;
import com.quotaapp.backend.repository.primary.UserRepository;
import com.quotaapp.backend.repository.primary.VehicleOwnerRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for admin dashboard statistics
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminStatsController {

    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;
    private final VehicleOwnerRepository vehicleOwnerRepository;
    private final StationOwnerRepository stationOwnerRepository;
    private final FuelStationRepository fuelStationRepository;
    private final FuelTransactionRepository fuelTransactionRepository;
    private final FuelQuotaRepository fuelQuotaRepository;

    /**
     * Get system statistics for the admin dashboard
     *
     * @return the system statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemStats() {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Fetching system statistics for admin: {}", email);

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

        // Collect system statistics
        Map<String, Object> stats = new HashMap<>();

        // Count users by role
        long totalVehicleOwners = vehicleOwnerRepository.count();
        long totalStationOwners = stationOwnerRepository.count();
        long totalFuelStations = fuelStationRepository.count();
        long totalTransactions = fuelTransactionRepository.count();

        // Count pending station verifications
        long pendingApprovals = fuelStationRepository.countByVerificationStatus("PENDING");

        // Count active users (users who have logged in within the last 30 days)
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        long activeUsers = userRepository.countByLastLoginAfter(thirtyDaysAgo.atStartOfDay());

        // Calculate fuel statistics
        BigDecimal totalFuelAllocated = fuelQuotaRepository.sumTotalAllocatedAmount();
        BigDecimal totalFuelConsumed = fuelTransactionRepository.sumTotalFuelAmount();

        // Populate the stats map
        stats.put("totalVehicleOwners", totalVehicleOwners);
        stats.put("totalStationOwners", totalStationOwners);
        stats.put("totalFuelStations", totalFuelStations);
        stats.put("totalTransactions", totalTransactions);
        stats.put("pendingApprovals", pendingApprovals);
        stats.put("activeUsers", activeUsers);
        stats.put("fuelAllocated", totalFuelAllocated);
        stats.put("fuelConsumed", totalFuelConsumed);

        return ResponseEntity.ok(ApiResponse.success("System statistics retrieved successfully", stats));
    }

    /**
     * Get fuel consumption statistics for the admin dashboard
     *
     * @return the fuel consumption statistics
     */
    @GetMapping("/fuel-consumption/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFuelConsumptionStats() {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Fetching fuel consumption statistics for admin: {}", email);

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

        // Collect fuel consumption statistics
        Map<String, Object> stats = new HashMap<>();

        // Total fuel consumed
        BigDecimal totalFuelConsumed = fuelTransactionRepository.sumTotalFuelAmount();
        stats.put("totalFuelConsumed", totalFuelConsumed);

        // Get all transactions for analysis
        List<FuelTransaction> allTransactions = fuelTransactionRepository.findAll();

        // Fuel consumption by type
        Map<String, BigDecimal> consumptionByFuelType = allTransactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getFuelType().toString(),
                        Collectors.reducing(BigDecimal.ZERO, FuelTransaction::getAmount, BigDecimal::add)
                ));
        stats.put("consumptionByFuelType", consumptionByFuelType);

        // Recent consumption trends (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<FuelTransaction> recentTransactions = allTransactions.stream()
                .filter(t -> t.getTransactionDate().isAfter(thirtyDaysAgo))
                .collect(Collectors.toList());

        // Daily consumption for the last 30 days
        Map<String, BigDecimal> dailyConsumption = recentTransactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getTransactionDate().toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE),
                        Collectors.reducing(BigDecimal.ZERO, FuelTransaction::getAmount, BigDecimal::add)
                ));
        stats.put("dailyConsumption", dailyConsumption);

        // Top consuming stations
        Map<String, BigDecimal> consumptionByStation = allTransactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getStation().getStationName(),
                        Collectors.reducing(BigDecimal.ZERO, FuelTransaction::getAmount, BigDecimal::add)
                ));
        stats.put("consumptionByStation", consumptionByStation);

        // Total transactions count
        stats.put("totalTransactions", allTransactions.size());

        // Average consumption per transaction
        BigDecimal avgConsumption = allTransactions.isEmpty() ? BigDecimal.ZERO :
                totalFuelConsumed.divide(BigDecimal.valueOf(allTransactions.size()), 2, java.math.RoundingMode.HALF_UP);
        stats.put("averageConsumptionPerTransaction", avgConsumption);

        return ResponseEntity.ok(ApiResponse.success("Fuel consumption statistics retrieved successfully", stats));
    }

    /**
     * Get detailed fuel consumption analytics with filtering
     *
     * @param startDate the start date for filtering (optional)
     * @param endDate the end date for filtering (optional)
     * @param fuelType the fuel type for filtering (optional)
     * @param stationId the station ID for filtering (optional)
     * @return the detailed fuel consumption analytics
     */
    @GetMapping("/fuel-consumption/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFuelConsumptionAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String fuelType,
            @RequestParam(required = false) Long stationId) {

        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Fetching detailed fuel consumption analytics for admin: {}", email);

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

        // Get all transactions
        List<FuelTransaction> allTransactions = fuelTransactionRepository.findAll();

        // Apply filters
        List<FuelTransaction> filteredTransactions = allTransactions.stream()
                .filter(t -> startDate == null || !t.getTransactionDate().toLocalDate().isBefore(startDate))
                .filter(t -> endDate == null || !t.getTransactionDate().toLocalDate().isAfter(endDate))
                .filter(t -> fuelType == null || t.getFuelType().toString().equals(fuelType))
                .filter(t -> stationId == null || t.getStation().getId().equals(stationId))
                .collect(Collectors.toList());

        // Collect detailed analytics
        Map<String, Object> analytics = new HashMap<>();

        // Total consumption in filtered period
        BigDecimal totalConsumption = filteredTransactions.stream()
                .map(FuelTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        analytics.put("totalConsumption", totalConsumption);

        // Consumption by fuel type
        Map<String, BigDecimal> consumptionByType = filteredTransactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getFuelType().toString(),
                        Collectors.reducing(BigDecimal.ZERO, FuelTransaction::getAmount, BigDecimal::add)
                ));
        analytics.put("consumptionByFuelType", consumptionByType);

        // Consumption by station
        Map<String, BigDecimal> consumptionByStation = filteredTransactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getStation().getStationName(),
                        Collectors.reducing(BigDecimal.ZERO, FuelTransaction::getAmount, BigDecimal::add)
                ));
        analytics.put("consumptionByStation", consumptionByStation);

        // Monthly consumption trends
        Map<String, BigDecimal> monthlyConsumption = filteredTransactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getTransactionDate().toLocalDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                        Collectors.reducing(BigDecimal.ZERO, FuelTransaction::getAmount, BigDecimal::add)
                ));
        analytics.put("monthlyConsumption", monthlyConsumption);

        // Weekly consumption trends
        Map<String, BigDecimal> weeklyConsumption = filteredTransactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getTransactionDate().toLocalDate().format(DateTimeFormatter.ofPattern("yyyy-'W'ww")),
                        Collectors.reducing(BigDecimal.ZERO, FuelTransaction::getAmount, BigDecimal::add)
                ));
        analytics.put("weeklyConsumption", weeklyConsumption);

        // Transaction count
        analytics.put("transactionCount", filteredTransactions.size());

        // Average transaction amount
        BigDecimal avgTransaction = filteredTransactions.isEmpty() ? BigDecimal.ZERO :
                totalConsumption.divide(BigDecimal.valueOf(filteredTransactions.size()), 2, java.math.RoundingMode.HALF_UP);
        analytics.put("averageTransactionAmount", avgTransaction);

        return ResponseEntity.ok(ApiResponse.success("Detailed fuel consumption analytics retrieved successfully", analytics));
    }
}
