package com.quotaapp.backend.dto.inventory;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating fuel inventory
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryUpdateDTO implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @DecimalMin(value = "0.0", inclusive = true, message = "Current stock must be greater than or equal to 0")
    private BigDecimal currentStock;
    
    @DecimalMin(value = "0.0", inclusive = true, message = "Capacity must be greater than or equal to 0")
    private BigDecimal capacity;
    
    private LocalDateTime lastRefillDate;
    
    private LocalDateTime nextRefillDate;
    
    private String changeType; // REFILL, ADJUSTMENT, CORRECTION
    
    private String notes;
}
