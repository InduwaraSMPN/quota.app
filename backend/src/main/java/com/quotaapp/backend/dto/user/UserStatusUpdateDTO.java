package com.quotaapp.backend.dto.user;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating user account status
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatusUpdateDTO {
    
    @NotNull(message = "Account status is required")
    private Boolean isActive;
    
}
