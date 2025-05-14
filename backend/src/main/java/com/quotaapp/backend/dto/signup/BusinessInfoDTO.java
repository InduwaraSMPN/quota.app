package com.quotaapp.backend.dto.signup;

import java.io.Serializable;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessInfoDTO implements Serializable {

    private static final long serialVersionUID = 1L;

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

    @NotEmpty(message = "At least one fuel type must be selected")
    private List<String> fuelTypes;

    @NotBlank(message = "Opening time is required")
    private String openingTime;

    @NotBlank(message = "Closing time is required")
    private String closingTime;

    @NotBlank(message = "Fuel retail license number is required")
    @Size(max = 50, message = "Fuel retail license number must be less than 50 characters")
    private String fuelRetailLicenseNumber;
}
