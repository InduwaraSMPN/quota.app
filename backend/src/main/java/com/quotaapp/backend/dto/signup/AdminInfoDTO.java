package com.quotaapp.backend.dto.signup;

import java.io.Serializable;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for admin information during registration
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminInfoDTO implements Serializable {

    private static final long serialVersionUID = 1L;

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
