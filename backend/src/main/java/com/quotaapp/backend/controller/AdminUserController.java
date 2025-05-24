package com.quotaapp.backend.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.dto.user.UserDetailsDTO;
import com.quotaapp.backend.dto.user.UserStatusUpdateDTO;
import com.quotaapp.backend.dto.user.UserUpdateDTO;
import com.quotaapp.backend.exception.ResourceNotFoundException;
import com.quotaapp.backend.model.Role;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.model.VehicleOwner;
import com.quotaapp.backend.repository.primary.UserRepository;
import com.quotaapp.backend.repository.primary.VehicleOwnerRepository;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for admin user management
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Slf4j
public class AdminUserController {

    private final UserRepository userRepository;
    private final VehicleOwnerRepository vehicleOwnerRepository;

    /**
     * Get all vehicle owners with pagination, sorting, and filtering
     *
     * @param page the page number (0-based)
     * @param size the page size
     * @param sort the sort field
     * @param direction the sort direction
     * @param search the search term for name, email, or NIC
     * @param status the account status filter
     * @return a page of vehicle owners
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllVehicleOwners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean status) {

        log.info("Getting all vehicle owners with pagination: page={}, size={}, sort={}, direction={}, search={}, status={}",
                page, size, sort, direction, search, status);

        try {
            // Create pageable object for pagination and sorting
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));

            // Get users with role VEHICLE_OWNER
            Page<User> usersPage;

            if (search != null && !search.isEmpty()) {
                // Search by email
                usersPage = userRepository.findByRoleAndEmailContainingIgnoreCase(
                        Role.VEHICLE_OWNER, search, pageable);
            } else if (status != null) {
                // Filter by status
                usersPage = userRepository.findByRoleAndIsActive(
                        Role.VEHICLE_OWNER, status, pageable);
            } else {
                // Get all vehicle owners
                usersPage = userRepository.findByRole(Role.VEHICLE_OWNER, pageable);
            }

            // Convert users to DTOs
            List<UserDetailsDTO> users = usersPage.getContent().stream()
                    .map(user -> {
                        Optional<VehicleOwner> ownerOpt = vehicleOwnerRepository.findByUser(user);
                        if (ownerOpt.isPresent()) {
                            VehicleOwner owner = ownerOpt.get();
                            return UserDetailsDTO.builder()
                                    .id(user.getId())
                                    .email(user.getEmail())
                                    .fullName(owner.getFullName())
                                    .nicNumber(owner.getNicNumber())
                                    .address(owner.getAddress())
                                    .contactNumber(owner.getContactNumber())
                                    .isActive(user.isActive())
                                    .emailVerified(user.isEmailVerified())
                                    .createdAt(user.getCreatedAt())
                                    .lastLogin(user.getLastLogin())
                                    .build();
                        } else {
                            return UserDetailsDTO.builder()
                                    .id(user.getId())
                                    .email(user.getEmail())
                                    .isActive(user.isActive())
                                    .emailVerified(user.isEmailVerified())
                                    .createdAt(user.getCreatedAt())
                                    .lastLogin(user.getLastLogin())
                                    .build();
                        }
                    })
                    .collect(Collectors.toList());

            // Create response with pagination information
            Map<String, Object> response = new HashMap<>();
            response.put("users", users);
            response.put("currentPage", usersPage.getNumber());
            response.put("totalItems", usersPage.getTotalElements());
            response.put("totalPages", usersPage.getTotalPages());

            return ResponseEntity.ok(ApiResponse.success("Vehicle owners retrieved successfully", response));
        } catch (Exception e) {
            log.error("Error getting vehicle owners", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Error getting vehicle owners: " + e.getMessage()));
        }
    }

    /**
     * Get vehicle owner details by ID
     *
     * @param id the user ID
     * @return the vehicle owner details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDetailsDTO>> getVehicleOwnerById(@PathVariable Long id) {
        log.info("Getting vehicle owner with ID: {}", id);

        try {
            // Find user by ID
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

            // Check if user is a vehicle owner
            if (user.getRole() != Role.VEHICLE_OWNER) {
                return ResponseEntity.badRequest().body(ApiResponse.error("User is not a vehicle owner"));
            }

            // Get vehicle owner details
            VehicleOwner owner = vehicleOwnerRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle owner not found for user with ID: " + id));

            // Create DTO
            UserDetailsDTO userDetails = UserDetailsDTO.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(owner.getFullName())
                    .nicNumber(owner.getNicNumber())
                    .address(owner.getAddress())
                    .contactNumber(owner.getContactNumber())
                    .isActive(user.isActive())
                    .emailVerified(user.isEmailVerified())
                    .createdAt(user.getCreatedAt())
                    .lastLogin(user.getLastLogin())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Vehicle owner retrieved successfully", userDetails));
        } catch (ResourceNotFoundException e) {
            log.error("Vehicle owner not found", e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting vehicle owner", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Error getting vehicle owner: " + e.getMessage()));
        }
    }

    /**
     * Update vehicle owner information
     *
     * @param id the user ID
     * @param userUpdate the user update data
     * @return the updated vehicle owner details
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDetailsDTO>> updateVehicleOwner(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateDTO userUpdate) {

        log.info("Updating vehicle owner with ID: {}", id);

        try {
            // Find user by ID
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

            // Check if user is a vehicle owner
            if (user.getRole() != Role.VEHICLE_OWNER) {
                return ResponseEntity.badRequest().body(ApiResponse.error("User is not a vehicle owner"));
            }

            // Get vehicle owner details
            VehicleOwner owner = vehicleOwnerRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle owner not found for user with ID: " + id));

            // Update vehicle owner information
            if (userUpdate.getFullName() != null) {
                owner.setFullName(userUpdate.getFullName());
            }

            if (userUpdate.getAddress() != null) {
                owner.setAddress(userUpdate.getAddress());
            }

            if (userUpdate.getContactNumber() != null) {
                owner.setContactNumber(userUpdate.getContactNumber());
            }

            // Update timestamps
            owner.setUpdatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());

            // Save changes
            userRepository.save(user);
            vehicleOwnerRepository.save(owner);

            // Note: Vehicle owners don't have a direct notification system
            // This would require implementing a vehicle owner notification system
            log.info("Profile updated for vehicle owner: {}", user.getEmail());

            // Create DTO for response
            UserDetailsDTO userDetails = UserDetailsDTO.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(owner.getFullName())
                    .nicNumber(owner.getNicNumber())
                    .address(owner.getAddress())
                    .contactNumber(owner.getContactNumber())
                    .isActive(user.isActive())
                    .emailVerified(user.isEmailVerified())
                    .createdAt(user.getCreatedAt())
                    .lastLogin(user.getLastLogin())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Vehicle owner updated successfully", userDetails));
        } catch (ResourceNotFoundException e) {
            log.error("Vehicle owner not found", e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating vehicle owner", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Error updating vehicle owner: " + e.getMessage()));
        }
    }

    /**
     * Update vehicle owner account status (enable/disable)
     *
     * @param id the user ID
     * @param statusUpdate the status update data
     * @return the updated vehicle owner details
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserDetailsDTO>> updateVehicleOwnerStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateDTO statusUpdate) {

        log.info("Updating vehicle owner status with ID: {}, active: {}", id, statusUpdate.getIsActive());

        try {
            // Find user by ID
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

            // Check if user is a vehicle owner
            if (user.getRole() != Role.VEHICLE_OWNER) {
                return ResponseEntity.badRequest().body(ApiResponse.error("User is not a vehicle owner"));
            }

            // Get vehicle owner details
            VehicleOwner owner = vehicleOwnerRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle owner not found for user with ID: " + id));

            // Update account status
            user.setActive(statusUpdate.getIsActive());
            user.setUpdatedAt(LocalDateTime.now());

            // Save changes
            userRepository.save(user);

            // Note: Vehicle owners don't have a direct notification system
            // This would require implementing a vehicle owner notification system
            log.info("Account status updated for vehicle owner: {} - Active: {}", user.getEmail(), statusUpdate.getIsActive());

            // Create DTO for response
            UserDetailsDTO userDetails = UserDetailsDTO.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(owner.getFullName())
                    .nicNumber(owner.getNicNumber())
                    .address(owner.getAddress())
                    .contactNumber(owner.getContactNumber())
                    .isActive(user.isActive())
                    .emailVerified(user.isEmailVerified())
                    .createdAt(user.getCreatedAt())
                    .lastLogin(user.getLastLogin())
                    .build();

            return ResponseEntity.ok(ApiResponse.success(
                    statusUpdate.getIsActive() ? "Vehicle owner account activated successfully" : "Vehicle owner account deactivated successfully",
                    userDetails));
        } catch (ResourceNotFoundException e) {
            log.error("Vehicle owner not found", e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating vehicle owner status", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Error updating vehicle owner status: " + e.getMessage()));
        }
    }
}
