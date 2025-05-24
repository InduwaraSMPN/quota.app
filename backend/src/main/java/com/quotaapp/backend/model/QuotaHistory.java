package com.quotaapp.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity for quota history
 */
@Entity
@Table(name = "quota_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuotaHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "vehicle_class_id", nullable = false)
    private VehicleClass vehicleClass;
    
    @Column(name = "old_quota_amount", nullable = false)
    private double oldQuotaAmount;
    
    @Column(name = "new_quota_amount", nullable = false)
    private double newQuotaAmount;
    
    @Column(name = "changed_by", nullable = false)
    private String changedBy;
    
    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;
    
    @Column(name = "reason")
    private String reason;
    
}
