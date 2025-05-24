package com.quotaapp.backend.dto.user;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.quotaapp.backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for comprehensive user details across all user types
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDetailsDTO {

    private Long id;
    private String email;
    private Role userType;
    private String fullName;
    private String nicNumber;
    private String address;
    private String contactNumber;
    @JsonProperty("isActive")
    private boolean isActive;
    private boolean emailVerified;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;

    // Additional fields for specific user types
    private String employeeId; // For admin users
    private String departmentName; // For admin users
    private String businessName; // For station owners
    private String businessRegistrationNumber; // For station owners

}
