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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
