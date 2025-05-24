package com.quotaapp.backend.dto.mobile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO for mobile station registration request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MobileStationRegistrationDTO {
    
    // User Information
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", 
             message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    private String password;
    
    // Station Owner Information
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;
    
    @NotBlank(message = "NIC number is required")
    @Pattern(regexp = "^([0-9]{9}[vVxX]|[0-9]{12})$", message = "NIC number must be valid (9 digits + V/X or 12 digits)")
    private String nicNumber;
    
    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Contact number must be 10 digits")
    private String contactNumber;
    
    // Station Information
    @NotBlank(message = "Station name is required")
    @Size(min = 2, max = 100, message = "Station name must be between 2 and 100 characters")
    private String stationName;
    
    @NotBlank(message = "Business name is required")
    @Size(min = 2, max = 100, message = "Business name must be between 2 and 100 characters")
    private String businessName;
    
    @NotBlank(message = "Business address is required")
    @Size(min = 10, max = 255, message = "Business address must be between 10 and 255 characters")
    private String businessAddress;
    
    @NotBlank(message = "Business registration number is required")
    @Size(min = 5, max = 50, message = "Business registration number must be between 5 and 50 characters")
    private String businessRegistrationNumber;
    
    @NotBlank(message = "Fuel retail license number is required")
    @Size(min = 5, max = 50, message = "Fuel retail license number must be between 5 and 50 characters")
    private String fuelRetailLicenseNumber;
    
    @NotBlank(message = "Opening time is required")
    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Opening time must be in HH:MM format")
    private String openingTime;
    
    @NotBlank(message = "Closing time is required")
    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Closing time must be in HH:MM format")
    private String closingTime;
    
    @NotBlank(message = "Province is required")
    private String province;
    
    @NotBlank(message = "District is required")
    private String district;
}
