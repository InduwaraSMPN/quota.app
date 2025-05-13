package com.quotaapp.backend.dto.signup;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DMTValidationDTO {

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotBlank(message = "Engine number is required")
    private String engineNumber;

    @NotBlank(message = "Chassis number is required")
    private String chassisNumber;

    @NotBlank(message = "Owner NIC is required")
    private String ownerNIC;

    @NotBlank(message = "Owner name is required")
    private String ownerName;
}
