package com.quotaapp.backend.controller;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.model.AdminUser;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.repository.primary.AdminUserRepository;
import com.quotaapp.backend.repository.primary.FuelStationRepository;
import com.quotaapp.backend.repository.primary.UserRepository;
import com.quotaapp.backend.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

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
    private final NotificationService notificationService;

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
     * Get notifications for admin dashboard
     *
     * @return list of notifications
     */
    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNotifications() {
        try {
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

            // Find the admin user details
            Optional<AdminUser> adminUserOpt = adminUserRepository.findByUser(user);

            if (adminUserOpt.isEmpty()) {
                log.warn("Admin user details not found for user: {}", email);
                return ResponseEntity.status(404).body(ApiResponse.error("Admin user details not found"));
            }

            AdminUser adminUser = adminUserOpt.get();

            // Initialize default notifications if none exist
            notificationService.initializeDefaultNotifications();

            // Get notifications for the admin
            List<Map<String, Object>> notifications = notificationService.getAdminNotifications(adminUser.getId());

            return ResponseEntity.ok(ApiResponse.success("Admin notifications retrieved successfully", notifications));
        } catch (Exception e) {
            log.error("Error fetching admin notifications", e);
            return ResponseEntity.status(500).body(ApiResponse.error("An error occurred while fetching admin notifications"));
        }
    }

    /**
     * Mark a notification as read
     *
     * @param notificationId the notification ID
     * @return success or error response
     */
    @PostMapping("/notifications/{notificationId}/read")
    public ResponseEntity<ApiResponse<String>> markNotificationAsRead(@PathVariable Long notificationId) {
        try {
            // Get the authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            log.info("Marking notification as read: {} for admin: {}", notificationId, email);

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

            // Mark the notification as read
            boolean success = notificationService.markAdminNotificationAsRead(notificationId, adminUser.getId());

            if (success) {
                return ResponseEntity.ok(ApiResponse.success("Notification marked as read successfully"));
            } else {
                return ResponseEntity.status(404).body(ApiResponse.error("Notification not found or does not belong to this admin"));
            }
        } catch (Exception e) {
            log.error("Error marking notification as read", e);
            return ResponseEntity.status(500).body(ApiResponse.error("An error occurred while marking notification as read"));
        }
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
