package com.quotaapp.backend.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity class for fuel transactions
 */
@Entity
@Table(name = "fuel_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuelTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "station_id", nullable = false)
    private FuelStation station;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_type")
    private FuelType fuelType;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "amount")
    private BigDecimal amount;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "unit_price")
    private BigDecimal unitPrice;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "total_price")
    private BigDecimal totalPrice;

    @NotNull
    @Column(name = "transaction_date")
    private LocalDateTime transactionDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        
        // Set transaction date to current time if not provided
        if (this.transactionDate == null) {
            this.transactionDate = LocalDateTime.now();
        }
        
        // Calculate total price if not provided
        if (this.totalPrice == null && this.amount != null && this.unitPrice != null) {
            this.totalPrice = this.amount.multiply(this.unitPrice);
        }
    }
    
    /**
     * Validate the transaction data
     * 
     * @return true if the transaction data is valid, false otherwise
     */
    public boolean isValid() {
        if (amount == null || unitPrice == null || totalPrice == null) {
            return false;
        }
        
        // Calculate expected total price
        BigDecimal expectedTotal = amount.multiply(unitPrice).setScale(2, java.math.RoundingMode.HALF_UP);
        
        // Compare with actual total price (allowing for small rounding differences)
        return totalPrice.subtract(expectedTotal).abs().compareTo(new BigDecimal("0.01")) <= 0;
    }
}
