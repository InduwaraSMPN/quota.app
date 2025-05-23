package com.quotaapp.backend.dto.quota;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

import com.quotaapp.backend.model.FuelType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for quota details
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuotaDetailsDTO implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    private Long vehicleId;
    private String registrationNumber;
    private String vehicleClass;
    private FuelType fuelType;
    private BigDecimal allocatedAmount;
    private BigDecimal remainingAmount;
    private LocalDate allocationDate;
    private LocalDate expiryDate;
    private String quotaStatus; // ACTIVE, INACTIVE, EXPIRED
    private LocalDate nextAllocationDate;
}
