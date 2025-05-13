package com.quotaapp.backend.dto.signup;

import java.io.Serializable;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DMTValidationDTO implements Serializable {

    private static final long serialVersionUID = 1L;

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
