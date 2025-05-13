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

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserRepository userRepository;
    private final VehicleOwnerRepository vehicleOwnerRepository;

    /**
     * Get the current user's profile
     *
     * @return the user profile
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserProfile() {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        log.info("Fetching profile for user: {}", email);

        // Find the user in the database
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }
        
        User user = userOpt.get();
        
        // Create the response data
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("id", user.getId());
        profileData.put("email", user.getEmail());
        profileData.put("role", user.getRole().name());
        profileData.put("isActive", user.isActive());
        profileData.put("emailVerified", user.isEmailVerified());
        
        // If the user is a vehicle owner, add owner information
        if (user.getRole().name().equals("VEHICLE_OWNER")) {
            Optional<VehicleOwner> ownerOpt = vehicleOwnerRepository.findByUser(user);
            
            if (ownerOpt.isPresent()) {
                VehicleOwner owner = ownerOpt.get();
                profileData.put("fullName", owner.getFullName());
                profileData.put("nicNumber", owner.getNicNumber());
                profileData.put("address", owner.getAddress());
                profileData.put("contactNumber", owner.getContactNumber());
            }
        }
        
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", profileData));
    }

    /**
     * Update the current user's profile
     *
     * @param profileData the profile data to update
     * @return the updated user profile
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateUserProfile(@Valid @RequestBody Map<String, Object> profileData) {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        log.info("Updating profile for user: {}", email);

        // Find the user in the database
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }
        
        User user = userOpt.get();
        
        // Update user fields (only allowed fields)
        if (profileData.containsKey("email")) {
            // Email change requires additional verification, so we don't allow it here
            return ResponseEntity.badRequest().body(ApiResponse.error("Email cannot be changed through this endpoint"));
        }
        
        // If the user is a vehicle owner, update owner information
        if (user.getRole().name().equals("VEHICLE_OWNER")) {
            Optional<VehicleOwner> ownerOpt = vehicleOwnerRepository.findByUser(user);
            
            if (ownerOpt.isPresent()) {
                VehicleOwner owner = ownerOpt.get();
                
                // Update owner fields
                if (profileData.containsKey("fullName")) {
                    owner.setFullName((String) profileData.get("fullName"));
                }
                
                if (profileData.containsKey("address")) {
                    owner.setAddress((String) profileData.get("address"));
                }
                
                if (profileData.containsKey("contactNumber")) {
                    owner.setContactNumber((String) profileData.get("contactNumber"));
                }
                
                // NIC number cannot be changed
                if (profileData.containsKey("nicNumber")) {
                    return ResponseEntity.badRequest().body(ApiResponse.error("NIC number cannot be changed"));
                }
                
                // Save the updated owner
                vehicleOwnerRepository.save(owner);
            }
        }
        
        // Create the response data with updated information
        Map<String, Object> updatedProfileData = new HashMap<>();
        updatedProfileData.put("id", user.getId());
        updatedProfileData.put("email", user.getEmail());
        updatedProfileData.put("role", user.getRole().name());
        updatedProfileData.put("isActive", user.isActive());
        updatedProfileData.put("emailVerified", user.isEmailVerified());
        
        // If the user is a vehicle owner, add owner information
        if (user.getRole().name().equals("VEHICLE_OWNER")) {
            Optional<VehicleOwner> ownerOpt = vehicleOwnerRepository.findByUser(user);
            
            if (ownerOpt.isPresent()) {
                VehicleOwner owner = ownerOpt.get();
                updatedProfileData.put("fullName", owner.getFullName());
                updatedProfileData.put("nicNumber", owner.getNicNumber());
                updatedProfileData.put("address", owner.getAddress());
                updatedProfileData.put("contactNumber", owner.getContactNumber());
            }
        }
        
        return ResponseEntity.ok(ApiResponse.success("User profile updated successfully", updatedProfileData));
    }
}
