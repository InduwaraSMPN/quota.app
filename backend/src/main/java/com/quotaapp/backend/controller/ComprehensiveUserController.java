package com.quotaapp.backend.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import com.quotaapp.backend.model.AdminUser;
import com.quotaapp.backend.model.FuelStation;
import com.quotaapp.backend.model.Role;
import com.quotaapp.backend.model.StationOwner;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.model.VehicleOwner;
import com.quotaapp.backend.repository.primary.AdminUserRepository;
import com.quotaapp.backend.repository.primary.FuelStationRepository;
import com.quotaapp.backend.repository.primary.StationOwnerRepository;
import com.quotaapp.backend.repository.primary.UserRepository;
import com.quotaapp.backend.repository.primary.VehicleOwnerRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for comprehensive user management across all user types
 */
@RestController
@RequestMapping("/api/admin/all-users")
@RequiredArgsConstructor
@Slf4j
public class ComprehensiveUserController {

    private final UserRepository userRepository;
    private final VehicleOwnerRepository vehicleOwnerRepository;
    private final StationOwnerRepository stationOwnerRepository;
    private final AdminUserRepository adminUserRepository;
    private final FuelStationRepository fuelStationRepository;

    /**
     * Get all users across all types with pagination, sorting, and filtering
     *
     * @param page the page number (0-based)
     * @param size the page size
     * @param sort the sort field
     * @param direction the sort direction
     * @param search the search term for name, email, or NIC
     * @param status the account status filter
     * @param userType the user type filter (VEHICLE_OWNER, STATION_OWNER, ADMIN)
     * @return a page of users across all types
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) String userType) {

        log.info("Getting all users with pagination: page={}, size={}, sort={}, direction={}, search={}, status={}, userType={}",
                page, size, sort, direction, search, status, userType);

        try {
            // Create pageable object for pagination and sorting
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));

            // Get all users based on filters
            Page<User> usersPage;

            if (userType != null && !userType.isEmpty()) {
                Role roleFilter = Role.valueOf(userType.toUpperCase());
                if (search != null && !search.isEmpty()) {
                    usersPage = userRepository.findByRoleAndEmailContainingIgnoreCase(roleFilter, search, pageable);
                } else if (status != null) {
                    usersPage = userRepository.findByRoleAndIsActive(roleFilter, status, pageable);
                } else {
                    usersPage = userRepository.findByRole(roleFilter, pageable);
                }
            } else {
                // Get all users regardless of role
                if (search != null && !search.isEmpty()) {
                    usersPage = userRepository.findByEmailContainingIgnoreCase(search, pageable);
                } else if (status != null) {
                    usersPage = userRepository.findByIsActive(status, pageable);
                } else {
                    usersPage = userRepository.findAll(pageable);
                }
            }

            // Convert users to comprehensive DTOs
            List<UserDetailsDTO> users = usersPage.getContent().stream()
                    .map(this::convertToComprehensiveDTO)
                    .collect(Collectors.toList());

            // Create response with pagination information
            Map<String, Object> response = new HashMap<>();
            response.put("users", users);
            response.put("currentPage", usersPage.getNumber());
            response.put("totalItems", usersPage.getTotalElements());
            response.put("totalPages", usersPage.getTotalPages());

            return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", response));
        } catch (Exception e) {
            log.error("Error getting users", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Error getting users: " + e.getMessage()));
        }
    }

    /**
     * Get user details by ID (works for all user types)
     *
     * @param id the user ID
     * @return the user details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDetailsDTO>> getUserById(@PathVariable Long id) {
        log.info("Getting user with ID: {}", id);

        try {
            // Find user by ID
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

            // Convert to comprehensive DTO
            UserDetailsDTO userDetails = convertToComprehensiveDTO(user);

            return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", userDetails));
        } catch (ResourceNotFoundException e) {
            log.error("User not found", e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting user", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Error getting user: " + e.getMessage()));
        }
    }

    /**
     * Update user information (works for all user types)
     *
     * @param id the user ID
     * @param userUpdate the user update data
     * @return the updated user details
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDetailsDTO>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateDTO userUpdate) {

        log.info("Updating user with ID: {}", id);

        try {
            // Find user by ID
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

            // Update based on user type
            switch (user.getRole()) {
                case VEHICLE_OWNER:
                    updateVehicleOwnerDetails(user, userUpdate);
                    break;
                case STATION_OWNER:
                    updateStationOwnerDetails(user, userUpdate);
                    break;
                case ADMIN:
                    updateAdminUserDetails(user, userUpdate);
                    break;
                default:
                    return ResponseEntity.badRequest().body(ApiResponse.error("Unknown user type"));
            }

            // Update user timestamps
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            // Convert to comprehensive DTO for response
            UserDetailsDTO userDetails = convertToComprehensiveDTO(user);

            return ResponseEntity.ok(ApiResponse.success("User updated successfully", userDetails));
        } catch (ResourceNotFoundException e) {
            log.error("User not found", e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating user", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Error updating user: " + e.getMessage()));
        }
    }

    /**
     * Update user account status (enable/disable) - works for all user types
     *
     * @param id the user ID
     * @param statusUpdate the status update data
     * @return the updated user details
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserDetailsDTO>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateDTO statusUpdate) {

        log.info("Updating user status with ID: {}, active: {}", id, statusUpdate.getIsActive());

        try {
            // Find user by ID
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

            // Update account status
            user.setActive(statusUpdate.getIsActive());
            user.setUpdatedAt(LocalDateTime.now());

            // Save changes
            userRepository.save(user);

            log.info("Account status updated for user: {} - Active: {}", user.getEmail(), statusUpdate.getIsActive());

            // Convert to comprehensive DTO for response
            UserDetailsDTO userDetails = convertToComprehensiveDTO(user);

            return ResponseEntity.ok(ApiResponse.success(
                    statusUpdate.getIsActive() ? "User account activated successfully" : "User account deactivated successfully",
                    userDetails));
        } catch (ResourceNotFoundException e) {
            log.error("User not found", e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating user status", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Error updating user status: " + e.getMessage()));
        }
    }

    /**
     * Delete user (soft delete by deactivating) - works for all user types
     *
     * @param id the user ID
     * @return success response
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        log.info("Deleting user with ID: {}", id);

        try {
            // Find user by ID
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

            // Soft delete by deactivating the account
            user.setActive(false);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            log.info("User account deactivated (soft deleted): {}", user.getEmail());

            return ResponseEntity.ok(ApiResponse.success("User deleted successfully", "User account has been deactivated"));
        } catch (ResourceNotFoundException e) {
            log.error("User not found", e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error deleting user", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Error deleting user: " + e.getMessage()));
        }
    }

    /**
     * Convert a User entity to a comprehensive UserDetailsDTO
     *
     * @param user the user entity
     * @return the comprehensive DTO
     */
    private UserDetailsDTO convertToComprehensiveDTO(User user) {
        UserDetailsDTO.UserDetailsDTOBuilder builder = UserDetailsDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .userType(user.getRole())
                .isActive(user.isActive())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin());

        // Add role-specific information
        switch (user.getRole()) {
            case VEHICLE_OWNER:
                Optional<VehicleOwner> vehicleOwnerOpt = vehicleOwnerRepository.findByUser(user);
                if (vehicleOwnerOpt.isPresent()) {
                    VehicleOwner owner = vehicleOwnerOpt.get();
                    builder.fullName(owner.getFullName())
                           .nicNumber(owner.getNicNumber())
                           .address(owner.getAddress())
                           .contactNumber(owner.getContactNumber());
                }
                break;

            case STATION_OWNER:
                Optional<StationOwner> stationOwnerOpt = stationOwnerRepository.findByUser(user);
                if (stationOwnerOpt.isPresent()) {
                    StationOwner stationOwner = stationOwnerOpt.get();
                    builder.fullName(stationOwner.getFullName())
                           .nicNumber(stationOwner.getNicNumber())
                           .contactNumber(stationOwner.getContactNumber());

                    // Get business information from FuelStation
                    List<FuelStation> stations = fuelStationRepository.findByOwner(stationOwner);
                    if (!stations.isEmpty()) {
                        FuelStation station = stations.get(0); // Get the first station
                        builder.businessName(station.getBusinessName())
                               .businessRegistrationNumber(station.getBusinessRegistrationNumber());
                    }
                }
                break;

            case ADMIN:
                Optional<AdminUser> adminUserOpt = adminUserRepository.findByUser(user);
                if (adminUserOpt.isPresent()) {
                    AdminUser adminUser = adminUserOpt.get();
                    builder.fullName(adminUser.getFullName())
                           .employeeId(adminUser.getEmployeeId())
                           .departmentName(adminUser.getDepartment() != null ? adminUser.getDepartment().getName() : null);
                }
                break;
        }

        return builder.build();
    }

    /**
     * Update vehicle owner specific details
     */
    private void updateVehicleOwnerDetails(User user, UserUpdateDTO userUpdate) {
        Optional<VehicleOwner> ownerOpt = vehicleOwnerRepository.findByUser(user);
        if (ownerOpt.isPresent()) {
            VehicleOwner owner = ownerOpt.get();

            if (userUpdate.getFullName() != null) {
                owner.setFullName(userUpdate.getFullName());
            }
            if (userUpdate.getAddress() != null) {
                owner.setAddress(userUpdate.getAddress());
            }
            if (userUpdate.getContactNumber() != null) {
                owner.setContactNumber(userUpdate.getContactNumber());
            }

            owner.setUpdatedAt(LocalDateTime.now());
            vehicleOwnerRepository.save(owner);
        }
    }

    /**
     * Update station owner specific details
     */
    private void updateStationOwnerDetails(User user, UserUpdateDTO userUpdate) {
        Optional<StationOwner> stationOwnerOpt = stationOwnerRepository.findByUser(user);
        if (stationOwnerOpt.isPresent()) {
            StationOwner stationOwner = stationOwnerOpt.get();

            if (userUpdate.getFullName() != null) {
                stationOwner.setFullName(userUpdate.getFullName());
            }
            if (userUpdate.getContactNumber() != null) {
                stationOwner.setContactNumber(userUpdate.getContactNumber());
            }

            stationOwner.setUpdatedAt(LocalDateTime.now());
            stationOwnerRepository.save(stationOwner);
        }
    }

    /**
     * Update admin user specific details
     */
    private void updateAdminUserDetails(User user, UserUpdateDTO userUpdate) {
        Optional<AdminUser> adminUserOpt = adminUserRepository.findByUser(user);
        if (adminUserOpt.isPresent()) {
            AdminUser adminUser = adminUserOpt.get();

            if (userUpdate.getFullName() != null) {
                adminUser.setFullName(userUpdate.getFullName());
            }

            adminUser.setUpdatedAt(LocalDateTime.now());
            adminUserRepository.save(adminUser);
        }
    }
}
