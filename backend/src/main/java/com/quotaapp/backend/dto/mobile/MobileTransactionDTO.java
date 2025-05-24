package com.quotaapp.backend.dto.mobile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for mobile transaction response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MobileTransactionDTO {
    
    private Long id;
    private Long vehicleId;
    private String vehicleRegistrationNumber;
    private Long stationId;
    private String stationName;
    private String fuelType;
    private BigDecimal amount;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String transactionDate;
}
