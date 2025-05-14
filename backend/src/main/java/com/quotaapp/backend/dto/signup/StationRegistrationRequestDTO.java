package com.quotaapp.backend.dto.signup;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for station owner registration request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationRegistrationRequestDTO {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must be less than 100 characters")
    private String fullName;

    @NotBlank(message = "NIC number is required")
    @Size(min = 10, max = 12, message = "NIC number must be between 10 and 12 characters")
    @Pattern(regexp = "^[0-9]{9}[vVxX]$|^[0-9]{12}$", message = "NIC number must be in valid format")
    private String nicNumber;

    @NotBlank(message = "Contact number is required")
    @Size(min = 10, max = 15, message = "Contact number must be between 10 and 15 characters")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Contact number must be in valid format")
    private String contactNumber;

    @Valid
    private BusinessRegistrationDTO business;

    /**
     * DTO for business registration
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BusinessRegistrationDTO {

        @NotBlank(message = "Business registration number is required")
        @Size(max = 50, message = "Business registration number must be less than 50 characters")
        private String businessRegistrationNumber;

        @NotBlank(message = "Business name is required")
        @Size(max = 100, message = "Business name must be less than 100 characters")
        private String businessName;

        @NotBlank(message = "Business address is required")
        @Size(max = 200, message = "Business address must be less than 200 characters")
        private String businessAddress;

        @NotBlank(message = "Province is required")
        @Size(max = 50, message = "Province must be less than 50 characters")
        private String province;

        @NotBlank(message = "District is required")
        @Size(max = 50, message = "District must be less than 50 characters")
        private String district;

        @NotBlank(message = "Station name is required")
        @Size(max = 100, message = "Station name must be less than 100 characters")
        private String stationName;

        private List<String> fuelTypes;

        @NotBlank(message = "Opening time is required")
        private String openingTime;

        @NotBlank(message = "Closing time is required")
        private String closingTime;

        @NotBlank(message = "Fuel retail license number is required")
        @Size(max = 50, message = "Fuel retail license number must be less than 50 characters")
        private String fuelRetailLicenseNumber;
    }
}
