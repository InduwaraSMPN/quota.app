package com.quotaapp.backend.dto.mobile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for mobile quota details response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuotaDetailsDTO {
    
    private Long vehicleId;
    private BigDecimal totalQuota;
    private BigDecimal usedAmount;
    private BigDecimal remainingAmount;
    private String quotaStatus;
    private String lastRefuelDate;
    private String nextRefuelDate;
    private String fuelType;
    private String vehicleClass;
}
