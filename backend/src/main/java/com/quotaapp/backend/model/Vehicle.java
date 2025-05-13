package com.quotaapp.backend.model;

import java.time.LocalDate;
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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private VehicleOwner owner;

    @NotBlank
    @Size(max = 10)
    @Pattern(regexp = "^[A-Z0-9]{1,10}$", message = "Registration number must be in valid format without hyphens")
    @Column(name = "registration_number", unique = true)
    private String registrationNumber;

    @NotBlank
    @Size(max = 50)
    @Column(name = "engine_number")
    private String engineNumber;

    @NotBlank
    @Size(max = 50)
    @Column(name = "chassis_number")
    private String chassisNumber;

    @NotBlank
    @Size(max = 50)
    @Column(name = "make")
    private String make;

    @NotBlank
    @Size(max = 50)
    @Column(name = "model")
    private String model;

    @NotNull
    @Min(1900)
    @Column(name = "year_of_manufacture")
    private Integer yearOfManufacture;

    @ManyToOne
    @JoinColumn(name = "vehicle_class_id", nullable = false)
    private VehicleClass vehicleClass;

    @NotBlank
    @Size(max = 50)
    @Column(name = "type_of_body")
    private String typeOfBody;

    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_type")
    private FuelType fuelType;

    @NotNull
    @Min(1)
    @Column(name = "engine_capacity")
    private Integer engineCapacity;

    @NotBlank
    @Size(max = 30)
    @Column(name = "color")
    private String color;

    @NotNull
    @Min(1)
    @Column(name = "gross_vehicle_weight")
    private Integer grossVehicleWeight;

    @NotNull
    @PastOrPresent
    @Column(name = "date_of_first_registration")
    private LocalDate dateOfFirstRegistration;

    @NotBlank
    @Size(max = 50)
    @Column(name = "country_of_origin")
    private String countryOfOrigin;

    @Column(name = "is_active")
    @Builder.Default
    private boolean isActive = true;

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
}
