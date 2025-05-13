package com.quotaapp.backend.dto.signup;

import java.time.LocalDate;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleInfoDTO {

    @NotBlank(message = "Registration number is required")
    @Size(max = 10, message = "Registration number must be less than 10 characters")
    @Pattern(regexp = "^[A-Z0-9]{1,10}$", message = "Registration number must be in valid format without hyphens")
    private String registrationNumber;

    @NotBlank(message = "Engine number is required")
    @Size(max = 50, message = "Engine number must be less than 50 characters")
    private String engineNumber;

    @NotBlank(message = "Chassis number is required")
    @Size(max = 50, message = "Chassis number must be less than 50 characters")
    private String chassisNumber;

    @NotBlank(message = "Make is required")
    @Size(max = 50, message = "Make must be less than 50 characters")
    private String make;

    @NotBlank(message = "Model is required")
    @Size(max = 50, message = "Model must be less than 50 characters")
    private String model;

    @NotNull(message = "Year of manufacture is required")
    @Min(value = 1900, message = "Year of manufacture must be after 1900")
    private Integer yearOfManufacture;

    @NotBlank(message = "Vehicle class is required")
    private String vehicleClass;

    @NotBlank(message = "Type of body is required")
    @Size(max = 50, message = "Type of body must be less than 50 characters")
    private String typeOfBody;

    @NotBlank(message = "Fuel type is required")
    private String fuelType;

    @NotNull(message = "Engine capacity is required")
    @Min(value = 1, message = "Engine capacity must be greater than 0")
    private Integer engineCapacity;

    @NotBlank(message = "Color is required")
    @Size(max = 30, message = "Color must be less than 30 characters")
    private String color;

    @NotNull(message = "Gross vehicle weight is required")
    @Min(value = 1, message = "Gross vehicle weight must be greater than 0")
    private Integer grossVehicleWeight;

    @NotNull(message = "Date of first registration is required")
    @PastOrPresent(message = "Date of first registration must be in the past or present")
    private LocalDate dateOfFirstRegistration;

    @NotBlank(message = "Country of origin is required")
    @Size(max = 50, message = "Country of origin must be less than 50 characters")
    private String countryOfOrigin;
}
