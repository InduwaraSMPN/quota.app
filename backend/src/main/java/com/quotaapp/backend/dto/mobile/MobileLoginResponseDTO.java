package com.quotaapp.backend.dto.mobile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for mobile login response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MobileLoginResponseDTO {
    
    private String token;
    private UserInfo user;
    private StationOwnerInfo stationOwner;
    private StationInfo station;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInfo {
        private Long id;
        private String email;
        private String role;
        private Boolean isActive;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StationOwnerInfo {
        private Long id;
        private String fullName;
        private String contactNumber;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StationInfo {
        private Long id;
        private String stationName;
        private String verificationStatus;
        private Boolean isActive;
    }
}
