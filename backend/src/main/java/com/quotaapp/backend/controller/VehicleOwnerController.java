package com.quotaapp.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.model.VehicleOwner;
import com.quotaapp.backend.repository.primary.UserRepository;
import com.quotaapp.backend.repository.primary.VehicleOwnerRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controller for vehicle owner-specific endpoints
 */
@RestController
@RequestMapping("/api/vehicle-owner")
@RequiredArgsConstructor
@Slf4j
public class VehicleOwnerController {

    private final UserRepository userRepository;
    private final VehicleOwnerRepository vehicleOwnerRepository;

    /**
     * Get the vehicle owner's profile
     *
     * @return the vehicle owner profile
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getVehicleOwnerProfile() {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        log.info("Fetching vehicle owner profile for user: {}", email);

        // Find the user in the database
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }
        
        User user = userOpt.get();
        
        // Verify that the user is a vehicle owner
        if (!user.getRole().name().equals("VEHICLE_OWNER")) {
            log.warn("User is not a vehicle owner: {}", email);
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Vehicle owner privileges required."));
        }
        
        // Find the vehicle owner details
        Optional<VehicleOwner> vehicleOwnerOpt = vehicleOwnerRepository.findByUser(user);
        
        if (vehicleOwnerOpt.isEmpty()) {
            log.warn("Vehicle owner details not found for user: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("Vehicle owner details not found"));
        }
        
        VehicleOwner vehicleOwner = vehicleOwnerOpt.get();
        
        // Create the response data
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("id", user.getId());
        profileData.put("email", user.getEmail());
        profileData.put("username", user.getEmail()); // Using email as username for consistency with frontend
        profileData.put("role", user.getRole().name());
        profileData.put("isActive", user.isActive());
        profileData.put("emailVerified", user.isEmailVerified());
        profileData.put("fullName", vehicleOwner.getFullName());
        profileData.put("nicNumber", vehicleOwner.getNicNumber());
        profileData.put("address", vehicleOwner.getAddress());
        profileData.put("contactNumber", vehicleOwner.getContactNumber());
        
        return ResponseEntity.ok(ApiResponse.success("Vehicle owner profile retrieved successfully", profileData));
    }

    /**
     * Update the vehicle owner's profile
     *
     * @param profileData the profile data to update
     * @return the updated vehicle owner profile
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateVehicleOwnerProfile(@Valid @RequestBody Map<String, Object> profileData) {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        log.info("Updating vehicle owner profile for user: {}", email);

        // Find the user in the database
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }
        
        User user = userOpt.get();
        
        // Verify that the user is a vehicle owner
        if (!user.getRole().name().equals("VEHICLE_OWNER")) {
            log.warn("User is not a vehicle owner: {}", email);
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Vehicle owner privileges required."));
        }
        
        // Find the vehicle owner details
        Optional<VehicleOwner> vehicleOwnerOpt = vehicleOwnerRepository.findByUser(user);
        
        if (vehicleOwnerOpt.isEmpty()) {
            log.warn("Vehicle owner details not found for user: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("Vehicle owner details not found"));
        }
        
        VehicleOwner vehicleOwner = vehicleOwnerOpt.get();
        
        // Update vehicle owner fields
        if (profileData.containsKey("fullName")) {
            vehicleOwner.setFullName((String) profileData.get("fullName"));
        }
        
        if (profileData.containsKey("address")) {
            vehicleOwner.setAddress((String) profileData.get("address"));
        }
        
        if (profileData.containsKey("contactNumber")) {
            vehicleOwner.setContactNumber((String) profileData.get("contactNumber"));
        }
        
        // NIC number cannot be changed
        if (profileData.containsKey("nicNumber")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("NIC number cannot be changed"));
        }
        
        // Save the updated vehicle owner
        vehicleOwnerRepository.save(vehicleOwner);
        
        // Create the response data with updated information
        Map<String, Object> updatedProfileData = new HashMap<>();
        updatedProfileData.put("id", user.getId());
        updatedProfileData.put("email", user.getEmail());
        updatedProfileData.put("username", user.getEmail());
        updatedProfileData.put("role", user.getRole().name());
        updatedProfileData.put("isActive", user.isActive());
        updatedProfileData.put("emailVerified", user.isEmailVerified());
        updatedProfileData.put("fullName", vehicleOwner.getFullName());
        updatedProfileData.put("nicNumber", vehicleOwner.getNicNumber());
        updatedProfileData.put("address", vehicleOwner.getAddress());
        updatedProfileData.put("contactNumber", vehicleOwner.getContactNumber());
        
        return ResponseEntity.ok(ApiResponse.success("Vehicle owner profile updated successfully", updatedProfileData));
    }
}
