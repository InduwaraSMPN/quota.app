package com.quotaapp.backend.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity class for tracking fuel inventory history
 */
@Entity
@Table(name = "fuel_inventory_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuelInventoryHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "inventory_id", nullable = false)
    private FuelInventory inventory;

    @NotNull
    @Column(name = "previous_stock")
    private BigDecimal previousStock;

    @NotNull
    @Column(name = "new_stock")
    private BigDecimal newStock;

    @NotNull
    @Column(name = "change_amount")
    private BigDecimal changeAmount;

    @Column(name = "change_type")
    private String changeType; // REFILL, ADJUSTMENT, CORRECTION

    @Column(name = "notes")
    private String notes;

    @ManyToOne
    @JoinColumn(name = "changed_by", nullable = false)
    private User changedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
