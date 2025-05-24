package com.quotaapp.backend.dto.mobile;

import com.quotaapp.backend.model.FuelType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/**
 * DTO for mobile transaction creation request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionCreateDTO {
    
    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;
    
    @NotNull(message = "Station ID is required")
    private Long stationId;
    
    @NotNull(message = "Fuel type is required")
    private FuelType fuelType;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.1", message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.01", message = "Unit price must be greater than 0")
    private BigDecimal unitPrice;
}
