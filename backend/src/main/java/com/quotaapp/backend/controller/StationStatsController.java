package com.quotaapp.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
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
import com.quotaapp.backend.model.FuelInventory;
import com.quotaapp.backend.model.FuelStation;
import com.quotaapp.backend.model.FuelType;
import com.quotaapp.backend.model.StationFuelType;
import com.quotaapp.backend.model.StationOwner;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.repository.primary.FuelInventoryRepository;
import com.quotaapp.backend.repository.primary.FuelStationRepository;
import com.quotaapp.backend.repository.primary.FuelTransactionRepository;
import com.quotaapp.backend.repository.primary.StationFuelTypeRepository;
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
    private final FuelInventoryRepository fuelInventoryRepository;
    private final StationFuelTypeRepository stationFuelTypeRepository;

    /**
     * Get station statistics for the station dashboard
     *
     * @return the station statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStationStats() {
        try {
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

            // Get the station ID directly to avoid loading the full entity with collections
            Long stationId = fuelStationRepository.findIdByOwner(stationOwner);

            if (stationId == null) {
                log.warn("Fuel station not found for owner: {}", stationOwner.getId());
                return ResponseEntity.status(404).body(ApiResponse.error("Fuel station not found"));
            }

            // Get the station without loading collections
            Optional<FuelStation> stationOpt = fuelStationRepository.findById(stationId);

            if (stationOpt.isEmpty()) {
                log.warn("Fuel station not found with ID: {}", stationId);
                return ResponseEntity.status(404).body(ApiResponse.error("Fuel station not found"));
            }

            FuelStation station = stationOpt.get();

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
            long daysPassed = LocalDate.now().getDayOfMonth();
            double averagePerDay = daysPassed > 0 ? (double) transactionsThisMonth / daysPassed : 0;

            // Fuel inventory
            Map<String, Object> fuelInventory = new HashMap<>();

            // Get fuel inventory for the station
            List<FuelInventory> inventoryList = fuelInventoryRepository.findByStation(station);

            for (FuelInventory inventory : inventoryList) {
                FuelType fuelType = inventory.getFuelType();
                String key = fuelTypeToKey(fuelType);

                Map<String, Object> fuelData = new HashMap<>();
                fuelData.put("total", inventory.getCapacity());
                fuelData.put("remaining", inventory.getCurrentStock());
                fuelData.put("unit", "liters");

                fuelInventory.put(key, fuelData);
            }

            // If no inventory records found, use station fuel types as fallback
            if (inventoryList.isEmpty()) {
                // Fetch station fuel types separately to avoid ConcurrentModificationException
                List<StationFuelType> stationFuelTypes = stationFuelTypeRepository.findByStation(station);

                for (StationFuelType stationFuelType : stationFuelTypes) {
                    FuelType fuelType = stationFuelType.getFuelType();
                    String key = fuelTypeToKey(fuelType);

                    Map<String, Object> fuelData = new HashMap<>();
                    // Default values since actual inventory not available
                    fuelData.put("total", BigDecimal.valueOf(1000));
                    fuelData.put("remaining", BigDecimal.valueOf(500));
                    fuelData.put("unit", "liters");

                    fuelInventory.put(key, fuelData);
                }
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
        } catch (Exception e) {
            log.error("Error fetching station statistics", e);
            return ResponseEntity.status(500).body(ApiResponse.error("An error occurred while fetching station statistics"));
        }
    }

    /**
     * Convert a FuelType enum to a key for the fuel inventory map
     *
     * @param fuelType the fuel type
     * @return the key
     */
    /**
     * Get station details for the station dashboard
     *
     * @return the station details
     */
    @GetMapping("/details")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStationDetails() {
        try {
            // Get the authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            log.info("Fetching station details for user: {}", email);

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

            // Get station details using a direct query to avoid lazy loading issues
            List<Object[]> stationDataList = fuelStationRepository.findStationDetailsByUserEmail(email);

            if (stationDataList == null || stationDataList.isEmpty()) {
                log.warn("Fuel station not found for user: {}", email);
                return ResponseEntity.status(404).body(ApiResponse.error("Fuel station not found"));
            }

            // Get the first row of data
            Object[] stationData = stationDataList.get(0);

            // Log the actual data received for debugging
            log.info("Station data received: list size={}, row length={}, data={}",
                    stationDataList.size(), stationData.length, Arrays.toString(stationData));

            // Log detailed information about each element in the array
            logDetailedArrayInfo(stationData, "Station");

            // Collect station details with null checks and array bounds validation
            Map<String, Object> stationDetails = new HashMap<>();

            // Add station ID (required for further queries)
            if (stationData.length > 0 && stationData[0] != null) {
                stationDetails.put("id", stationData[0]);
            } else {
                log.warn("Station ID is missing in the query result");
                return ResponseEntity.status(500).body(ApiResponse.error("Invalid station data: missing ID"));
            }

            // Add other station details with null checks
            stationDetails.put("name", stationData.length > 1 ? stationData[1] : "Unknown");
            stationDetails.put("registrationNumber", stationData.length > 2 ? stationData[2] : "Unknown");
            stationDetails.put("address", stationData.length > 3 ? stationData[3] : "Unknown");
            stationDetails.put("openingTime", stationData.length > 4 ? stationData[4] : "09:00");
            stationDetails.put("closingTime", stationData.length > 5 ? stationData[5] : "17:00");
            stationDetails.put("verificationStatus", stationData.length > 6 ? stationData[6] : "PENDING");

            // Get fuel types using a direct query
            List<Object[]> fuelTypeData = fuelStationRepository.findStationFuelTypesByStationId((Long) stationData[0]);
            List<Map<String, Object>> fuelTypes = new ArrayList<>();

            // Log information about the fuel type data
            log.info("Fuel type data: count={}", fuelTypeData.size());
            if (!fuelTypeData.isEmpty()) {
                logDetailedArrayInfo(fuelTypeData.get(0), "FuelType");
            }

            for (Object[] fuelType : fuelTypeData) {
                if (fuelType != null && fuelType.length > 0) {
                    Map<String, Object> fuelTypeMap = new HashMap<>();
                    fuelTypeMap.put("type", fuelType.length > 0 ? fuelType[0] : "UNKNOWN");
                    fuelTypeMap.put("available", fuelType.length > 1 ? fuelType[1] : Boolean.FALSE);
                    fuelTypeMap.put("unitPrice", fuelType.length > 2 ? fuelType[2] : BigDecimal.ZERO);
                    fuelTypes.add(fuelTypeMap);
                }
            }
            stationDetails.put("fuelTypes", fuelTypes);

            // Add owner details with null checks
            Map<String, Object> ownerDetails = new HashMap<>();
            ownerDetails.put("id", stationData.length > 7 ? stationData[7] : null);
            ownerDetails.put("fullName", stationData.length > 8 ? stationData[8] : "Unknown");
            ownerDetails.put("contactNumber", stationData.length > 9 ? stationData[9] : "Unknown");
            ownerDetails.put("nic", stationData.length > 10 ? stationData[10] : "Unknown");
            stationDetails.put("owner", ownerDetails);

            return ResponseEntity.ok(ApiResponse.success("Station details retrieved successfully", stationDetails));
        } catch (Exception e) {
            log.error("Error fetching station details: {}", e.getMessage(), e);

            // Provide more detailed error information for debugging
            String errorMessage = "An error occurred while fetching station details";
            if (e instanceof IndexOutOfBoundsException) {
                errorMessage += ": Array index out of bounds";
            } else if (e instanceof NullPointerException) {
                errorMessage += ": Null value encountered";
            }

            return ResponseEntity.status(500).body(ApiResponse.error(errorMessage));
        }
    }

    /**
     * Helper method to log detailed information about an array of objects
     *
     * @param data the array of objects to log
     * @param source a description of the data source for the log message
     */
    private void logDetailedArrayInfo(Object[] data, String source) {
        if (data == null) {
            log.info("{} data is null", source);
            return;
        }

        log.info("{} data length: {}", source, data.length);

        for (int i = 0; i < data.length; i++) {
            Object item = data[i];
            String itemType = item != null ? item.getClass().getName() : "null";
            String itemValue = String.valueOf(item);
            log.info("{} data[{}]: type={}, value={}", source, i, itemType, itemValue);
        }
    }

    /**
     * Get notifications for a station
     *
     * @return the station notifications
     */
    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStationNotifications() {
        try {
            // Get the authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            log.info("Fetching station notifications for user: {}", email);

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

            // For now, return some sample notifications
            // In a real implementation, this would fetch from a notifications table
            List<Map<String, Object>> notifications = new ArrayList<>();

            // Sample notification 1
            Map<String, Object> notification1 = new HashMap<>();
            notification1.put("id", 1);
            notification1.put("title", "Fuel Price Update");
            notification1.put("message", "Fuel prices have been updated. Please check the latest prices.");
            notification1.put("type", "INFO");
            notification1.put("isRead", false);
            notification1.put("createdAt", LocalDateTime.now().minusDays(1));
            notifications.add(notification1);

            // Sample notification 2
            Map<String, Object> notification2 = new HashMap<>();
            notification2.put("id", 2);
            notification2.put("title", "System Maintenance");
            notification2.put("message", "System maintenance scheduled for tonight from 2 AM to 4 AM.");
            notification2.put("type", "WARNING");
            notification2.put("isRead", true);
            notification2.put("createdAt", LocalDateTime.now().minusDays(3));
            notifications.add(notification2);

            // Sample notification 3
            Map<String, Object> notification3 = new HashMap<>();
            notification3.put("id", 3);
            notification3.put("title", "New Feature Available");
            notification3.put("message", "You can now view detailed transaction reports. Check the reports section.");
            notification3.put("type", "INFO");
            notification3.put("isRead", false);
            notification3.put("createdAt", LocalDateTime.now().minusDays(5));
            notifications.add(notification3);

            return ResponseEntity.ok(ApiResponse.success("Station notifications retrieved successfully", notifications));
        } catch (Exception e) {
            log.error("Error fetching station notifications", e);
            return ResponseEntity.status(500).body(ApiResponse.error("An error occurred while fetching station notifications"));
        }
    }

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
