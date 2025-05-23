package com.quotaapp.backend.model.dmt;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vehicle_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DMTVehicleRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "registration_number", unique = true)
    private String registrationNumber;

    @Column(name = "engine_number")
    private String engineNumber;

    @Column(name = "chassis_number", unique = true)
    private String chassisNumber;

    @Column(name = "make")
    private String make;

    @Column(name = "model")
    private String model;

    @Column(name = "year_of_manufacture")
    private Integer yearOfManufacture;

    @Column(name = "vehicle_class_code")
    private String vehicleClassCode;

    @Column(name = "type_of_body")
    private String typeOfBody;

    @Column(name = "engine_capacity")
    private Integer engineCapacity;

    @Column(name = "gross_vehicle_weight")
    private Integer grossVehicleWeight;

    @Column(name = "owner_nic")
    private String ownerNic;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "owner_address")
    private String ownerAddress;

    @Column(name = "date_of_registration")
    private LocalDate dateOfRegistration;

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
