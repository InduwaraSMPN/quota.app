package com.quotaapp.backend.dto.station;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for station details
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationDetailsDTO {
    
    private Long id;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private String ownerContactNumber;
    private String businessRegistrationNumber;
    private String businessName;
    private String businessAddress;
    private String verificationStatus;
    private String rejectionReason;
    private List<Map<String, Object>> fuelTypes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
}
