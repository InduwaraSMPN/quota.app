package com.quotaapp.backend.dto.station;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating station verification status
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationStatusUpdateDTO {
    
    @NotNull(message = "Status is required")
    @Pattern(regexp = "^(PENDING|VERIFIED|REJECTED)$", message = "Status must be one of: PENDING, VERIFIED, REJECTED")
    private String status;
    
    private String rejectionReason;
    
}
