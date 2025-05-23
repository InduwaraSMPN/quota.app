package com.quotaapp.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.dto.inventory.InventoryUpdateDTO;
import com.quotaapp.backend.model.FuelInventory;
import com.quotaapp.backend.model.FuelInventoryHistory;
import com.quotaapp.backend.model.FuelStation;
import com.quotaapp.backend.model.FuelType;
import com.quotaapp.backend.model.StationOwner;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.repository.primary.FuelInventoryHistoryRepository;
import com.quotaapp.backend.repository.primary.FuelInventoryRepository;
import com.quotaapp.backend.repository.primary.FuelStationRepository;
import com.quotaapp.backend.repository.primary.StationOwnerRepository;
import com.quotaapp.backend.repository.primary.UserRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for fuel inventory management
 */
@RestController
@RequestMapping("/api/station/inventory")
@RequiredArgsConstructor
@Slf4j
public class FuelInventoryController {

    private final UserRepository userRepository;
    private final StationOwnerRepository stationOwnerRepository;
    private final FuelStationRepository fuelStationRepository;
    private final FuelInventoryRepository fuelInventoryRepository;
    private final FuelInventoryHistoryRepository fuelInventoryHistoryRepository;

    /**
     * Get all inventory for the station
     *
     * @param fuelType optional fuel type filter
     * @return list of inventory items
     */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getInventory(
            @RequestParam(required = false) FuelType fuelType) {

        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Fetching inventory for user: {}", email);

        try {
            // Find the user in the database
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                log.warn("User not found: {}", email);
                return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
            }

            User user = userOpt.get();

            // Find the station owner
            Optional<StationOwner> stationOwnerOpt = stationOwnerRepository.findByUser(user);

            if (stationOwnerOpt.isEmpty()) {
                log.warn("Station owner not found for user: {}", email);
                return ResponseEntity.status(404).body(ApiResponse.error("Station owner not found"));
            }

            StationOwner stationOwner = stationOwnerOpt.get();

            // Find the station ID directly instead of loading the full entity with collections
            Long stationId = fuelStationRepository.findIdByOwner(stationOwner);

            if (stationId == null) {
                log.warn("Station not found for owner: {}", stationOwner.getId());
                return ResponseEntity.status(404).body(ApiResponse.error("Station not found"));
            }

            // Get inventory for the station
            List<FuelInventory> inventoryList;

            if (fuelType != null) {
                // Use a native query to avoid loading the full station entity
                Optional<FuelInventory> inventoryOpt = fuelInventoryRepository.findByStationAndFuelType(
                        FuelStation.builder().id(stationId).build(), fuelType);
                inventoryList = inventoryOpt.map(List::of).orElse(List.of());
            } else {
                // Use a native query to avoid loading the full station entity
                inventoryList = fuelInventoryRepository.findByStation(
                        FuelStation.builder().id(stationId).build());
            }

            // Map to response format
            List<Map<String, Object>> response = new ArrayList<>();

            for (FuelInventory inventory : inventoryList) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", inventory.getId());
                item.put("fuelType", inventory.getFuelType());
                item.put("displayName", inventory.getFuelType().getDisplayName());
                item.put("currentStock", inventory.getCurrentStock());
                item.put("capacity", inventory.getCapacity());
                item.put("lastRefillDate", inventory.getLastRefillDate());
                item.put("nextRefillDate", inventory.getNextRefillDate());
                item.put("updatedAt", inventory.getUpdatedAt());

                // Calculate percentage
                double percentage = inventory.getCapacity().doubleValue() > 0
                    ? (inventory.getCurrentStock().doubleValue() / inventory.getCapacity().doubleValue()) * 100
                    : 0;
                item.put("percentage", Math.round(percentage * 100.0) / 100.0); // Round to 2 decimal places

                response.add(item);
            }

            return ResponseEntity.ok(ApiResponse.success("Inventory retrieved successfully", response));
        } catch (Exception e) {
            log.error("Error fetching inventory: ", e);
            return ResponseEntity.status(500).body(ApiResponse.error("An error occurred while fetching inventory data"));
        }
    }

    /**
     * Update inventory for a specific fuel type
     *
     * @param inventoryId the inventory ID
     * @param update the update data
     * @return the updated inventory
     */
    @PutMapping("/{inventoryId}")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateInventory(
            @PathVariable Long inventoryId,
            @Valid @RequestBody InventoryUpdateDTO update) {

        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Updating inventory ID: {} for user: {}", inventoryId, email);

        try {
            // Find the user in the database
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                log.warn("User not found: {}", email);
                return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
            }

            User user = userOpt.get();

            // Find the station owner
            Optional<StationOwner> stationOwnerOpt = stationOwnerRepository.findByUser(user);

            if (stationOwnerOpt.isEmpty()) {
                log.warn("Station owner not found for user: {}", email);
                return ResponseEntity.status(404).body(ApiResponse.error("Station owner not found"));
            }

            StationOwner stationOwner = stationOwnerOpt.get();

            // Find the station ID directly instead of loading the full entity with collections
            Long stationId = fuelStationRepository.findIdByOwner(stationOwner);

            if (stationId == null) {
                log.warn("Station not found for owner: {}", stationOwner.getId());
                return ResponseEntity.status(404).body(ApiResponse.error("Station not found"));
            }

            // Find the inventory
            Optional<FuelInventory> inventoryOpt = fuelInventoryRepository.findById(inventoryId);

            if (inventoryOpt.isEmpty()) {
                log.warn("Inventory not found with ID: {}", inventoryId);
                return ResponseEntity.status(404).body(ApiResponse.error("Inventory not found"));
            }

            FuelInventory inventory = inventoryOpt.get();

            // Verify that the inventory belongs to the station
            if (!inventory.getStation().getId().equals(stationId)) {
                log.warn("Inventory ID: {} does not belong to station ID: {}", inventoryId, stationId);
                return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to inventory"));
            }

            // Save the previous values for history
            BigDecimal previousStock = inventory.getCurrentStock();

            // Update the inventory
            if (update.getCurrentStock() != null) {
                inventory.setCurrentStock(update.getCurrentStock());
            }

            if (update.getCapacity() != null) {
                inventory.setCapacity(update.getCapacity());
            }

            if (update.getLastRefillDate() != null) {
                inventory.setLastRefillDate(update.getLastRefillDate());
            }

            if (update.getNextRefillDate() != null) {
                inventory.setNextRefillDate(update.getNextRefillDate());
            }

            // Save the updated inventory
            inventory = fuelInventoryRepository.save(inventory);

            // Create history record
            FuelInventoryHistory history = FuelInventoryHistory.builder()
                    .inventory(inventory)
                    .previousStock(previousStock)
                    .newStock(inventory.getCurrentStock())
                    .changeAmount(inventory.getCurrentStock().subtract(previousStock))
                    .changeType(update.getChangeType())
                    .notes(update.getNotes())
                    .changedBy(user)
                    .build();

            fuelInventoryHistoryRepository.save(history);

            // Map to response format
            Map<String, Object> response = new HashMap<>();
            response.put("id", inventory.getId());
            response.put("fuelType", inventory.getFuelType());
            response.put("displayName", inventory.getFuelType().getDisplayName());
            response.put("currentStock", inventory.getCurrentStock());
            response.put("capacity", inventory.getCapacity());
            response.put("lastRefillDate", inventory.getLastRefillDate());
            response.put("nextRefillDate", inventory.getNextRefillDate());
            response.put("updatedAt", inventory.getUpdatedAt());

            // Calculate percentage
            double percentage = inventory.getCapacity().doubleValue() > 0
                ? (inventory.getCurrentStock().doubleValue() / inventory.getCapacity().doubleValue()) * 100
                : 0;
            response.put("percentage", Math.round(percentage * 100.0) / 100.0); // Round to 2 decimal places

            return ResponseEntity.ok(ApiResponse.success("Inventory updated successfully", response));
        } catch (Exception e) {
            log.error("Error updating inventory: ", e);
            return ResponseEntity.status(500).body(ApiResponse.error("An error occurred while updating inventory data"));
        }
    }

    /**
     * Get inventory history for a specific fuel type
     *
     * @param inventoryId the inventory ID
     * @param startDate optional start date filter
     * @param endDate optional end date filter
     * @param page the page number
     * @param size the page size
     * @return the inventory history
     */
    @GetMapping("/{inventoryId}/history")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInventoryHistory(
            @PathVariable Long inventoryId,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Fetching inventory history for inventory ID: {} for user: {}", inventoryId, email);

        try {
            // Find the user in the database
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                log.warn("User not found: {}", email);
                return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
            }

            User user = userOpt.get();

            // Find the station owner
            Optional<StationOwner> stationOwnerOpt = stationOwnerRepository.findByUser(user);

            if (stationOwnerOpt.isEmpty()) {
                log.warn("Station owner not found for user: {}", email);
                return ResponseEntity.status(404).body(ApiResponse.error("Station owner not found"));
            }

            StationOwner stationOwner = stationOwnerOpt.get();

            // Find the station ID directly instead of loading the full entity with collections
            Long stationId = fuelStationRepository.findIdByOwner(stationOwner);

            if (stationId == null) {
                log.warn("Station not found for owner: {}", stationOwner.getId());
                return ResponseEntity.status(404).body(ApiResponse.error("Station not found"));
            }

            // Find the inventory
            Optional<FuelInventory> inventoryOpt = fuelInventoryRepository.findById(inventoryId);

            if (inventoryOpt.isEmpty()) {
                log.warn("Inventory not found with ID: {}", inventoryId);
                return ResponseEntity.status(404).body(ApiResponse.error("Inventory not found"));
            }

            FuelInventory inventory = inventoryOpt.get();

            // Verify that the inventory belongs to the station
            if (!inventory.getStation().getId().equals(stationId)) {
                log.warn("Inventory ID: {} does not belong to station ID: {}", inventoryId, stationId);
                return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to inventory"));
            }

            // Create pageable for sorting by created date descending
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

            // Get inventory history
            Page<FuelInventoryHistory> historyPage;

            if (startDate != null && endDate != null) {
                // Filter by date range if provided
                historyPage = fuelInventoryHistoryRepository.findByInventoryAndDateRange(
                        inventory, startDate, endDate, pageable);
            } else {
                // Get all history for the inventory
                historyPage = fuelInventoryHistoryRepository.findByInventory(inventory, pageable);
            }

            // Map to response format
            List<Map<String, Object>> historyItems = new ArrayList<>();

            for (FuelInventoryHistory history : historyPage.getContent()) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", history.getId());
                item.put("previousStock", history.getPreviousStock());
                item.put("newStock", history.getNewStock());
                item.put("changeAmount", history.getChangeAmount());
                item.put("changeType", history.getChangeType());
                item.put("notes", history.getNotes());
                item.put("changedBy", history.getChangedBy().getEmail());
                item.put("createdAt", history.getCreatedAt());

                historyItems.add(item);
            }

            // Create response with pagination info
            Map<String, Object> response = new HashMap<>();
            response.put("content", historyItems);
            response.put("page", historyPage.getNumber());
            response.put("size", historyPage.getSize());
            response.put("totalElements", historyPage.getTotalElements());
            response.put("totalPages", historyPage.getTotalPages());
            response.put("first", historyPage.isFirst());
            response.put("last", historyPage.isLast());
            response.put("empty", historyPage.isEmpty());

            return ResponseEntity.ok(ApiResponse.success("Inventory history retrieved successfully", response));
        } catch (Exception e) {
            log.error("Error fetching inventory history: ", e);
            return ResponseEntity.status(500).body(ApiResponse.error("An error occurred while fetching inventory history"));
        }
    }
}
