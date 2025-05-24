package com.quotaapp.backend.dto.quota;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for quota history
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuotaHistoryDTO {
    
    private Long id;
    private Long vehicleClassId;
    private String vehicleClassCode;
    private double oldQuotaAmount;
    private double newQuotaAmount;
    private String changedBy;
    private LocalDateTime changedAt;
    private String reason;
    
}
