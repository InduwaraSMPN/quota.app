package com.quotaapp.backend.dto.mobile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for mobile vehicle validation response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleValidationDTO {
    
    private Long vehicleId;
    private String registrationNumber;
    private String make;
    private String model;
    private String fuelType;
    private Boolean isValid;
    private String message;
    private QuotaDetailsDTO quotaDetails;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuotaDetailsDTO {
        private BigDecimal totalQuota;
        private BigDecimal usedAmount;
        private BigDecimal remainingAmount;
        private String quotaStatus;
        private String lastRefuelDate;
        private String nextRefuelDate;
    }
}
