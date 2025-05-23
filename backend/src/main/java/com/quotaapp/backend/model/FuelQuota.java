package com.quotaapp.backend.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity class for fuel quotas
 */
@Entity
@Table(name = "fuel_quotas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuelQuota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "allocated_amount")
    private BigDecimal allocatedAmount;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "remaining_amount")
    private BigDecimal remainingAmount;

    @NotNull
    @Column(name = "allocation_date")
    private LocalDate allocationDate;

    @NotNull
    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Check if the quota is valid for the current date
     * 
     * @return true if the quota is valid, false otherwise
     */
    public boolean isValid() {
        LocalDate today = LocalDate.now();
        return !today.isBefore(allocationDate) && !today.isAfter(expiryDate);
    }
    
    /**
     * Check if the quota has sufficient amount for the requested amount
     * 
     * @param requestedAmount the amount to check
     * @return true if the quota has sufficient amount, false otherwise
     */
    public boolean hasSufficientAmount(BigDecimal requestedAmount) {
        return remainingAmount.compareTo(requestedAmount) >= 0;
    }
    
    /**
     * Deduct the specified amount from the remaining quota
     * 
     * @param amount the amount to deduct
     * @return the updated remaining amount
     * @throws IllegalArgumentException if the amount is greater than the remaining amount
     */
    public BigDecimal deduct(BigDecimal amount) {
        if (amount.compareTo(remainingAmount) > 0) {
            throw new IllegalArgumentException("Deduction amount exceeds remaining quota");
        }
        
        remainingAmount = remainingAmount.subtract(amount);
        return remainingAmount;
    }
}
