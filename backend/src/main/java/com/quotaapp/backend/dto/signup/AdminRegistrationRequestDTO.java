package com.quotaapp.backend.dto.signup;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for admin registration request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminRegistrationRequestDTO {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must be less than 100 characters")
    private String fullName;

    @NotBlank(message = "Employee ID is required")
    @Size(max = 50, message = "Employee ID must be less than 50 characters")
    private String employeeId;

    @NotBlank(message = "Department is required")
    @Size(max = 50, message = "Department must be less than 50 characters")
    private String department;

    @NotBlank(message = "Contact number is required")
    @Size(min = 10, max = 15, message = "Contact number must be between 10 and 15 characters")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Contact number must be in valid format")
    private String contactNumber;

    @NotBlank(message = "Emergency contact number is required")
    @Size(min = 10, max = 15, message = "Emergency contact number must be between 10 and 15 characters")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Emergency contact number must be in valid format")
    private String emergencyContactNumber;

    @NotBlank(message = "Address is required")
    private String address;
}
