package com.quotaapp.backend.dto.transaction;

import java.io.Serializable;
import java.math.BigDecimal;

import com.quotaapp.backend.model.FuelType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a fuel transaction
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionCreateDTO implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;
    
    @NotNull(message = "Station ID is required")
    private Long stationId;
    
    @NotNull(message = "Fuel type is required")
    private FuelType fuelType;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.01", message = "Unit price must be greater than 0")
    private BigDecimal unitPrice;
}
