package com.quotaapp.backend.dto.mobile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO for mobile station profile update request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationProfileUpdateDTO {
    
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;
    
    @Pattern(regexp = "^[0-9]{10}$", message = "Contact number must be 10 digits")
    private String contactNumber;
    
    @Size(min = 2, max = 100, message = "Station name must be between 2 and 100 characters")
    private String stationName;
    
    @Size(min = 10, max = 255, message = "Business address must be between 10 and 255 characters")
    private String businessAddress;
    
    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Opening time must be in HH:MM format")
    private String openingTime;
    
    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Closing time must be in HH:MM format")
    private String closingTime;
}
