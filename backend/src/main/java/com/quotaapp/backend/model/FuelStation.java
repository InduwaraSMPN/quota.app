package com.quotaapp.backend.model;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "fuel_stations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"stationFuelTypes"})
@EqualsAndHashCode(exclude = {"stationFuelTypes"})
public class FuelStation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private StationOwner owner;

    @NotBlank
    @Size(max = 50)
    @Column(name = "business_registration_number", unique = true)
    private String businessRegistrationNumber;

    @NotBlank
    @Size(max = 100)
    @Column(name = "business_name")
    private String businessName;

    @NotBlank
    @Size(max = 200)
    @Column(name = "business_address")
    private String businessAddress;

    @ManyToOne
    @JoinColumn(name = "province_id", nullable = false)
    private Province province;

    @NotBlank
    @Size(max = 50)
    @Column(name = "province")
    private String provinceName;

    @ManyToOne
    @JoinColumn(name = "district_id", nullable = false)
    private District district;

    @NotBlank
    @Size(max = 50)
    @Column(name = "district")
    private String districtName;

    @NotBlank
    @Size(max = 100)
    @Column(name = "station_name")
    private String stationName;

    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<StationFuelType> stationFuelTypes = new HashSet<>();

    @NotNull
    @Column(name = "opening_time")
    private LocalTime openingTime;

    @NotNull
    @Column(name = "closing_time")
    private LocalTime closingTime;

    @NotBlank
    @Size(max = 50)
    @Column(name = "fuel_retail_license_number", unique = true)
    private String fuelRetailLicenseNumber;

    @Column(name = "is_active")
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "verification_status")
    @Builder.Default
    private String verificationStatus = "PENDING";

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
