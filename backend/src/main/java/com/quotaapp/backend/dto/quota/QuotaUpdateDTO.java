package com.quotaapp.backend.dto.quota;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating quota amount
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuotaUpdateDTO {
    
    @NotNull(message = "Quota amount is required")
    @Min(value = 0, message = "Quota amount must be greater than or equal to 0")
    private Double quotaAmount;
    
    private String reason;
    
}
