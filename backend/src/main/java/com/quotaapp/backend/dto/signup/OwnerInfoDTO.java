package com.quotaapp.backend.dto.signup;

import jakarta.validation.constraints.NotBlank;
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
public class OwnerInfoDTO {

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must be less than 100 characters")
    private String fullName;

    @NotBlank(message = "NIC number is required")
    @Size(min = 10, max = 12, message = "NIC number must be between 10 and 12 characters")
    @Pattern(regexp = "^[0-9]{9}[vVxX]$|^[0-9]{12}$", message = "NIC number must be in valid format")
    private String nicNumber;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Contact number is required")
    @Size(min = 10, max = 15, message = "Contact number must be between 10 and 15 characters")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Contact number must be in valid format")
    private String contactNumber;
}
