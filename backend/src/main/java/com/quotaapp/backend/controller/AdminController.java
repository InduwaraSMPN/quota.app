package com.quotaapp.backend.controller;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.model.AdminUser;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.repository.primary.AdminUserRepository;
import com.quotaapp.backend.repository.primary.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import java.util.HashMap;
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
}
