package com.quotaapp.backend.dto.signup;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for storing all registration data in the session
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationSessionDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private LoginInfoDTO loginInfo;
    private PasswordSetupDTO passwordSetup;
    private OwnerInfoDTO ownerInfo;
    private VehicleInfoDTO vehicleInfo;
    private StationOwnerInfoDTO stationOwnerInfo;
    private BusinessInfoDTO businessInfo;
    private Boolean emailVerified;
    private Integer currentStep;
}
