package com.quotaapp.backend.dto.quota;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for quota allocation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuotaAllocationDTO implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;
    
    @NotNull(message = "Allocated amount is required")
    @DecimalMin(value = "0.01", message = "Allocated amount must be greater than 0")
    private BigDecimal allocatedAmount;
    
    @NotNull(message = "Allocation date is required")
    private LocalDate allocationDate;
    
    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;
}
