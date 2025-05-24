package com.quotaapp.backend.dto.mobile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for mobile notification response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MobileNotificationDTO {
    
    private Long id;
    private String title;
    private String message;
    private String type;
    private Boolean isRead;
    private String createdAt;
}
