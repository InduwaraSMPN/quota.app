package com.quotaapp.backend.controller;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.dto.mobile.MobileStationDetailsDTO;
import com.quotaapp.backend.dto.mobile.MobileTransactionDTO;
import com.quotaapp.backend.dto.mobile.MobileNotificationDTO;
import com.quotaapp.backend.dto.mobile.StationProfileUpdateDTO;
import com.quotaapp.backend.exception.ResourceNotFoundException;
import com.quotaapp.backend.model.*;
import com.quotaapp.backend.repository.primary.*;
import com.quotaapp.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Mobile Station Controller for fuel station operators
 * Handles station details, transactions, notifications, and profile management
 */
@RestController
@RequestMapping("/api/mobile/station")
@RequiredArgsConstructor
@Slf4j
public class MobileStationController {

    private final UserRepository userRepository;
    private final StationOwnerRepository stationOwnerRepository;
    private final FuelStationRepository fuelStationRepository;
    private final FuelTransactionRepository fuelTransactionRepository;
    private final NotificationService notificationService;

    /**
     * Get station details for the authenticated station owner
     */
    @GetMapping("/details")
    public ResponseEntity<ApiResponse<MobileStationDetailsDTO>> getStationDetails() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            log.info("Getting station details for user: {}", email);

            // Find the user
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
            }

            User user = userOpt.get();

            // Find the station owner
            Optional<StationOwner> stationOwnerOpt = stationOwnerRepository.findByUser(user);
            if (stationOwnerOpt.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("Station owner not found"));
            }

            StationOwner stationOwner = stationOwnerOpt.get();

            // Find the fuel station
            List<FuelStation> stations = fuelStationRepository.findByOwner(stationOwner);
            if (stations.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("Fuel station not found"));
            }

            FuelStation station = stations.get(0); // Get the first station

            // Build the response DTO
            MobileStationDetailsDTO stationDetails = MobileStationDetailsDTO.builder()
                    .id(station.getId())
                    .stationName(station.getStationName())
                    .businessName(station.getBusinessName())
                    .businessAddress(station.getBusinessAddress())
                    .businessRegistrationNumber(station.getBusinessRegistrationNumber())
                    .fuelRetailLicenseNumber(station.getFuelRetailLicenseNumber())
                    .openingTime(station.getOpeningTime().toString())
                    .closingTime(station.getClosingTime().toString())
                    .province(station.getProvinceName())
                    .district(station.getDistrictName())
                    .verificationStatus(station.getVerificationStatus())
                    .isActive(station.isActive())
                    .owner(MobileStationDetailsDTO.OwnerInfo.builder()
                            .id(stationOwner.getId())
                            .fullName(stationOwner.getFullName())
                            .nicNumber(stationOwner.getNicNumber())
                            .contactNumber(stationOwner.getContactNumber())
                            .user(MobileStationDetailsDTO.UserInfo.builder()
                                    .id(user.getId())
                                    .email(user.getEmail())
                                    .role(user.getRole().name())
                                    .isActive(user.isActive())
                                    .lastLogin(user.getLastLogin() != null ?
                                        user.getLastLogin().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null)
                                    .build())
                            .build())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Station details retrieved successfully", stationDetails));

        } catch (Exception e) {
            log.error("Error getting station details: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to retrieve station details"));
        }
    }

    /**
     * Get station transactions with pagination and filtering
     */
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Page<MobileTransactionDTO>>> getStationTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            log.info("Getting transactions for user: {}, page: {}, size: {}", email, page, size);

            // Find the station
            FuelStation station = getStationByUserEmail(email);
            if (station == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("Station not found"));
            }

            // Create pageable
            Pageable pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending());

            // Get transactions
            Page<FuelTransaction> transactions;
            if (startDate != null && endDate != null) {
                // Parse ISO format dates (e.g., "2025-05-24T18:30:00.000Z")
                LocalDateTime start = parseISODateTime(startDate);
                LocalDateTime end = parseISODateTime(endDate);
                transactions = fuelTransactionRepository.findByStationIdAndTransactionDateBetween(
                    station.getId(), start, end, pageable);
            } else {
                transactions = fuelTransactionRepository.findByStationId(station.getId(), pageable);
            }

            // Convert to DTOs
            Page<MobileTransactionDTO> transactionDTOs = transactions.map(this::convertToMobileTransactionDTO);

            return ResponseEntity.ok(ApiResponse.success("Transactions retrieved successfully", transactionDTOs));

        } catch (Exception e) {
            log.error("Error getting station transactions: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to retrieve transactions"));
        }
    }

    /**
     * Get station notifications
     */
    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<MobileNotificationDTO>>> getStationNotifications() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            log.info("Getting notifications for user: {}", email);

            // Find the user
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
            }

            User user = userOpt.get();

            // Get notifications for the user
            List<Notification> notifications = notificationService.getUserNotifications(user.getId());

            // Convert to DTOs
            List<MobileNotificationDTO> notificationDTOs = notifications.stream()
                    .map(this::convertToMobileNotificationDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", notificationDTOs));

        } catch (Exception e) {
            log.error("Error getting station notifications: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to retrieve notifications"));
        }
    }

    /**
     * Update station profile
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<MobileStationDetailsDTO>> updateStationProfile(
            @Valid @RequestBody StationProfileUpdateDTO updateRequest) {

        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            log.info("Updating station profile for user: {}", email);

            // Find the station
            FuelStation station = getStationByUserEmail(email);
            if (station == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("Station not found"));
            }

            StationOwner stationOwner = station.getOwner();

            // Update station owner information
            if (updateRequest.getFullName() != null) {
                stationOwner.setFullName(updateRequest.getFullName());
            }
            if (updateRequest.getContactNumber() != null) {
                stationOwner.setContactNumber(updateRequest.getContactNumber());
            }

            // Update station information
            if (updateRequest.getStationName() != null) {
                station.setStationName(updateRequest.getStationName());
            }
            if (updateRequest.getBusinessAddress() != null) {
                station.setBusinessAddress(updateRequest.getBusinessAddress());
            }
            if (updateRequest.getOpeningTime() != null) {
                station.setOpeningTime(LocalTime.parse(updateRequest.getOpeningTime()));
            }
            if (updateRequest.getClosingTime() != null) {
                station.setClosingTime(LocalTime.parse(updateRequest.getClosingTime()));
            }

            // Update timestamps
            stationOwner.setUpdatedAt(LocalDateTime.now());
            station.setUpdatedAt(LocalDateTime.now());

            // Save changes
            stationOwnerRepository.save(stationOwner);
            fuelStationRepository.save(station);

            // Return updated station details
            return getStationDetails();

        } catch (Exception e) {
            log.error("Error updating station profile: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to update station profile"));
        }
    }

    // Helper methods

    private FuelStation getStationByUserEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return null;
        }

        Optional<StationOwner> stationOwnerOpt = stationOwnerRepository.findByUser(userOpt.get());
        if (stationOwnerOpt.isEmpty()) {
            return null;
        }

        List<FuelStation> stations = fuelStationRepository.findByOwner(stationOwnerOpt.get());
        return stations.isEmpty() ? null : stations.get(0);
    }

    private MobileTransactionDTO convertToMobileTransactionDTO(FuelTransaction transaction) {
        return MobileTransactionDTO.builder()
                .id(transaction.getId())
                .vehicleId(transaction.getVehicle().getId())
                .vehicleRegistrationNumber(transaction.getVehicle().getRegistrationNumber())
                .stationId(transaction.getStation().getId())
                .stationName(transaction.getStation().getStationName())
                .fuelType(transaction.getFuelType().name())
                .amount(transaction.getAmount())
                .unitPrice(transaction.getUnitPrice())
                .totalPrice(transaction.getTotalPrice())
                .transactionDate(transaction.getTransactionDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build();
    }

    private MobileNotificationDTO convertToMobileNotificationDTO(Notification notification) {
        return MobileNotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build();
    }
}
