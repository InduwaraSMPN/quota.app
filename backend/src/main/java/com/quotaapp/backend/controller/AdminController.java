package com.quotaapp.backend.controller;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.model.AdminUser;
import com.quotaapp.backend.model.FuelStation;
import com.quotaapp.backend.model.FuelTransaction;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.repository.primary.AdminUserRepository;
import com.quotaapp.backend.repository.primary.FuelStationRepository;
import com.quotaapp.backend.repository.primary.FuelTransactionRepository;
import com.quotaapp.backend.repository.primary.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller for admin-specific endpoints
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;
    private final FuelStationRepository fuelStationRepository;
    private final FuelTransactionRepository fuelTransactionRepository;

    /**
     * Get the admin user's profile
     *
     * @return the admin profile
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminProfile() {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Fetching admin profile for user: {}", email);

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

        // Find the admin user details
        Optional<AdminUser> adminUserOpt = adminUserRepository.findByUser(user);

        if (adminUserOpt.isEmpty()) {
            log.warn("Admin user details not found for user: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("Admin user details not found"));
        }

        AdminUser adminUser = adminUserOpt.get();

        // Create the response data
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("id", user.getId());
        profileData.put("email", user.getEmail());
        profileData.put("username", user.getEmail()); // Using email as username for consistency with frontend
        profileData.put("role", user.getRole().name());
        profileData.put("isActive", user.isActive());
        profileData.put("emailVerified", user.isEmailVerified());
        profileData.put("fullName", adminUser.getFullName());
        profileData.put("employeeId", adminUser.getEmployeeId());
        profileData.put("department", adminUser.getDepartment().getName());
        profileData.put("contactNumber", adminUser.getContactNumber());
        profileData.put("emergencyContactNumber", adminUser.getEmergencyContactNumber());
        profileData.put("address", adminUser.getAddress());

        return ResponseEntity.ok(ApiResponse.success("Admin profile retrieved successfully", profileData));
    }

    /**
     * Update the admin user's profile
     *
     * @param profileData the profile data to update
     * @return the updated admin profile
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateAdminProfile(@Valid @RequestBody Map<String, Object> profileData) {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Updating admin profile for user: {}", email);

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

        // Find the admin user details
        Optional<AdminUser> adminUserOpt = adminUserRepository.findByUser(user);

        if (adminUserOpt.isEmpty()) {
            log.warn("Admin user details not found for user: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("Admin user details not found"));
        }

        AdminUser adminUser = adminUserOpt.get();

        // Update admin user fields
        if (profileData.containsKey("fullName")) {
            adminUser.setFullName((String) profileData.get("fullName"));
        }

        if (profileData.containsKey("contactNumber")) {
            adminUser.setContactNumber((String) profileData.get("contactNumber"));
        }

        if (profileData.containsKey("emergencyContactNumber")) {
            adminUser.setEmergencyContactNumber((String) profileData.get("emergencyContactNumber"));
        }

        if (profileData.containsKey("address")) {
            adminUser.setAddress((String) profileData.get("address"));
        }

        // Employee ID and department cannot be changed
        if (profileData.containsKey("employeeId")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Employee ID cannot be changed"));
        }

        if (profileData.containsKey("department")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Department cannot be changed"));
        }

        // Save the updated admin user
        adminUserRepository.save(adminUser);

        // Create the response data with updated information
        Map<String, Object> updatedProfileData = new HashMap<>();
        updatedProfileData.put("id", user.getId());
        updatedProfileData.put("email", user.getEmail());
        updatedProfileData.put("username", user.getEmail());
        updatedProfileData.put("role", user.getRole().name());
        updatedProfileData.put("isActive", user.isActive());
        updatedProfileData.put("emailVerified", user.isEmailVerified());
        updatedProfileData.put("fullName", adminUser.getFullName());
        updatedProfileData.put("employeeId", adminUser.getEmployeeId());
        updatedProfileData.put("department", adminUser.getDepartment().getName());
        updatedProfileData.put("contactNumber", adminUser.getContactNumber());
        updatedProfileData.put("emergencyContactNumber", adminUser.getEmergencyContactNumber());
        updatedProfileData.put("address", adminUser.getAddress());

        return ResponseEntity.ok(ApiResponse.success("Admin profile updated successfully", updatedProfileData));
    }

    /**
     * Get recent transactions for admin dashboard
     *
     * @return list of recent transactions
     */
    @GetMapping("/transactions/recent")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRecentTransactions() {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Fetching recent transactions for admin: {}", email);

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

        // Get recent transactions (limit to 10)
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "transactionDate"));
        List<FuelTransaction> recentTransactions = fuelTransactionRepository.findAll(pageable).getContent();

        // Convert to response format
        List<Map<String, Object>> transactionsList = new ArrayList<>();
        for (FuelTransaction transaction : recentTransactions) {
            Map<String, Object> transactionMap = new HashMap<>();
            transactionMap.put("id", transaction.getId());
            transactionMap.put("stationId", transaction.getStation().getId());
            transactionMap.put("stationName", transaction.getStation().getStationName());
            transactionMap.put("vehicleId", transaction.getVehicle().getId());
            transactionMap.put("vehicleRegistrationNumber", transaction.getVehicle().getRegistrationNumber());
            transactionMap.put("fuelType", transaction.getFuelType().name());
            transactionMap.put("amount", transaction.getAmount());
            transactionMap.put("unitPrice", transaction.getUnitPrice());
            transactionMap.put("totalPrice", transaction.getTotalPrice());
            transactionMap.put("transactionDate", transaction.getTransactionDate());
            transactionsList.add(transactionMap);
        }

        return ResponseEntity.ok(ApiResponse.success("Recent transactions retrieved successfully", transactionsList));
    }

    /**
     * Get notifications for admin dashboard
     *
     * @return list of notifications
     */
    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNotifications() {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Fetching notifications for admin: {}", email);

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

        // For now, return some sample notifications
        // In a real implementation, this would fetch from a notifications table
        List<Map<String, Object>> notifications = new ArrayList<>();

        // Sample notification 1
        Map<String, Object> notification1 = new HashMap<>();
        notification1.put("id", 1);
        notification1.put("title", "New Station Registration");
        notification1.put("message", "A new fuel station has registered and is pending verification.");
        notification1.put("type", "INFO");
        notification1.put("isRead", false);
        notification1.put("createdAt", LocalDateTime.now().minusDays(1));
        notifications.add(notification1);

        // Sample notification 2
        Map<String, Object> notification2 = new HashMap<>();
        notification2.put("id", 2);
        notification2.put("title", "System Update");
        notification2.put("message", "The system will undergo maintenance tonight from 2 AM to 4 AM.");
        notification2.put("type", "WARNING");
        notification2.put("isRead", true);
        notification2.put("createdAt", LocalDateTime.now().minusDays(3));
        notifications.add(notification2);

        // Sample notification 3
        Map<String, Object> notification3 = new HashMap<>();
        notification3.put("id", 3);
        notification3.put("title", "Quota Allocation Complete");
        notification3.put("message", "Monthly fuel quota allocation has been completed for all vehicles.");
        notification3.put("type", "SUCCESS");
        notification3.put("isRead", false);
        notification3.put("createdAt", LocalDateTime.now().minusDays(5));
        notifications.add(notification3);

        return ResponseEntity.ok(ApiResponse.success("Admin notifications retrieved successfully", notifications));
    }

    /**
     * Get station verification requests for admin dashboard
     *
     * @return list of station verification requests
     */
    @GetMapping("/station-verifications")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStationVerifications() {
        try {
            // Get the authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            log.info("Fetching station verification requests for admin: {}", email);

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

            // Use a native query to avoid Hibernate's lazy loading issues
            List<Object[]> results = fuelStationRepository.findPendingStationsForVerification();

            // Convert to response format
            List<Map<String, Object>> stationsList = new ArrayList<>();
            for (Object[] result : results) {
                Map<String, Object> stationMap = new HashMap<>();
                stationMap.put("id", result[0]);
                stationMap.put("name", result[1]);
                stationMap.put("businessName", result[2]);
                stationMap.put("registrationNumber", result[3]);
                stationMap.put("address", result[4]);
                stationMap.put("province", result[5]);
                stationMap.put("district", result[6]);
                stationMap.put("ownerName", result[7]);
                stationMap.put("ownerContact", result[8]);
                stationMap.put("createdAt", result[9]);
                stationsList.add(stationMap);
            }

            return ResponseEntity.ok(ApiResponse.success("Station verification requests retrieved successfully", stationsList));
        } catch (Exception e) {
            log.error("Error fetching station verifications", e);
            return ResponseEntity.status(500).body(ApiResponse.error("An error occurred while fetching station verifications"));
        }
    }
}
