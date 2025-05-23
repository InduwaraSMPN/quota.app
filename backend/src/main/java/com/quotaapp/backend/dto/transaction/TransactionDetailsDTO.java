package com.quotaapp.backend.dto.transaction;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.quotaapp.backend.model.FuelType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for transaction details
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionDetailsDTO implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    private Long id;
    private Long vehicleId;
    private String vehicleRegistrationNumber;
    private Long stationId;
    private String stationName;
    private FuelType fuelType;
    private BigDecimal amount;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private LocalDateTime transactionDate;
}
