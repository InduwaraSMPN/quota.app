package com.quotaapp.backend.dto.station;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating station information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationUpdateDTO {
    
    @Size(max = 100, message = "Business name must be at most 100 characters")
    private String businessName;
    
    @Size(max = 200, message = "Business address must be at most 200 characters")
    private String businessAddress;
    
}
