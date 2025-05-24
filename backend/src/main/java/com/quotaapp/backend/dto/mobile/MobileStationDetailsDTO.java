package com.quotaapp.backend.dto.mobile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for mobile station details response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MobileStationDetailsDTO {
    
    private Long id;
    private String stationName;
    private String businessName;
    private String businessAddress;
    private String businessRegistrationNumber;
    private String fuelRetailLicenseNumber;
    private String openingTime;
    private String closingTime;
    private String province;
    private String district;
    private String verificationStatus;
    private Boolean isActive;
    private OwnerInfo owner;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OwnerInfo {
        private Long id;
        private String fullName;
        private String nicNumber;
        private String contactNumber;
        private UserInfo user;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInfo {
        private Long id;
        private String email;
        private String role;
        private Boolean isActive;
        private String lastLogin;
    }
}
