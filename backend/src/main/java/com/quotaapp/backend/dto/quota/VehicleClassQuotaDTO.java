package com.quotaapp.backend.dto.quota;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for vehicle class with quota amount
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleClassQuotaDTO {
    
    private Long id;
    private String code;
    private String description;
    private double quotaAmount;
    private LocalDateTime lastUpdated;
    
}
