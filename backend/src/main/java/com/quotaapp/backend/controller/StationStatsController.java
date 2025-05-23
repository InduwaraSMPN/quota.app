package com.quotaapp.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
import com.quotaapp.backend.model.FuelStation;
import com.quotaapp.backend.model.FuelType;
import com.quotaapp.backend.model.StationFuelType;
import com.quotaapp.backend.model.StationOwner;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.repository.primary.FuelStationRepository;
import com.quotaapp.backend.repository.primary.FuelTransactionRepository;
import com.quotaapp.backend.repository.primary.StationOwnerRepository;
import com.quotaapp.backend.repository.primary.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for station dashboard statistics
 */
@RestController
@RequestMapping("/api/station")
@RequiredArgsConstructor
@Slf4j
public class StationStatsController {

    private final UserRepository userRepository;
    private final StationOwnerRepository stationOwnerRepository;
    private final FuelStationRepository fuelStationRepository;
    private final FuelTransactionRepository fuelTransactionRepository;

    /**
     * Get station statistics for the station dashboard
     *
     * @return the station statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStationStats() {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Fetching station statistics for user: {}", email);

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

        // Get the station
        List<FuelStation> stations = fuelStationRepository.findByOwner(stationOwner);

        if (stations.isEmpty()) {
            log.warn("Fuel station not found for owner: {}", stationOwner.getId());
            return ResponseEntity.status(404).body(ApiResponse.error("Fuel station not found"));
        }

        // Get the first station (assuming one station per owner)
        FuelStation station = stations.get(0);

        // Collect station statistics
        Map<String, Object> stats = new HashMap<>();
        
        // Transaction statistics
        LocalDateTime today = LocalDate.now().atStartOfDay();
        LocalDateTime startOfWeek = LocalDate.now().minusDays(LocalDate.now().getDayOfWeek().getValue() - 1).atStartOfDay();
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        
        long transactionsToday = fuelTransactionRepository.countByStationAndTransactionDateBetween(
                station, today, today.plusDays(1).minusSeconds(1));
        
        long transactionsThisWeek = fuelTransactionRepository.countByStationAndTransactionDateBetween(
                station, startOfWeek, startOfWeek.plusDays(7).minusSeconds(1));
        
        long transactionsThisMonth = fuelTransactionRepository.countByStationAndTransactionDateBetween(
                station, startOfMonth, startOfMonth.plusMonths(1).minusSeconds(1));
        
        // Calculate average transactions per day for the current month
        long daysInMonth = LocalDate.now().lengthOfMonth();
        long daysPassed = LocalDate.now().getDayOfMonth();
        double averagePerDay = daysPassed > 0 ? (double) transactionsThisMonth / daysPassed : 0;
        
        // Fuel inventory
        Map<String, Object> fuelInventory = new HashMap<>();
        
        for (StationFuelType stationFuelType : station.getStationFuelTypes()) {
            FuelType fuelType = stationFuelType.getFuelType();
            String key = fuelTypeToKey(fuelType);
            
            Map<String, Object> fuelData = new HashMap<>();
            fuelData.put("total", stationFuelType.getCapacity());
            fuelData.put("remaining", stationFuelType.getCurrentStock());
            fuelData.put("unit", "liters");
            
            fuelInventory.put(key, fuelData);
        }
        
        // Populate transaction stats
        Map<String, Object> transactionStats = new HashMap<>();
        transactionStats.put("today", transactionsToday);
        transactionStats.put("thisWeek", transactionsThisWeek);
        transactionStats.put("thisMonth", transactionsThisMonth);
        transactionStats.put("averagePerDay", Math.round(averagePerDay));
        
        // Add to main stats
        stats.put("transactionStats", transactionStats);
        stats.put("fuelInventory", fuelInventory);

        return ResponseEntity.ok(ApiResponse.success("Station statistics retrieved successfully", stats));
    }
    
    /**
     * Convert a FuelType enum to a key for the fuel inventory map
     * 
     * @param fuelType the fuel type
     * @return the key
     */
    private String fuelTypeToKey(FuelType fuelType) {
        return switch (fuelType) {
            case OCTANE_92 -> "petrol92";
            case OCTANE_95 -> "petrol95";
            case AUTO_DIESEL -> "diesel";
            case SUPER_DIESEL -> "superDiesel";
            case KEROSENE -> "kerosene";
        };
    }
}
