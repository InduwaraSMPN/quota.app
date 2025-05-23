package com.quotaapp.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
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
}
