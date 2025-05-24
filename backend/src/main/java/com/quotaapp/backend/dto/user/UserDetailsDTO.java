package com.quotaapp.backend.dto.user;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for user details
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDetailsDTO {

    private Long id;
    private String email;
    private String fullName;
    private String nicNumber;
    private String address;
    private String contactNumber;
    @JsonProperty("isActive")
    private boolean isActive;
    private boolean emailVerified;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;

}
