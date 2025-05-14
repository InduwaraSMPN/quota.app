package com.quotaapp.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.dto.signup.StationRegistrationRequestDTO;
import com.quotaapp.backend.model.District;
import com.quotaapp.backend.model.FuelStation;
import com.quotaapp.backend.model.FuelType;
import com.quotaapp.backend.model.FuelTypeEntity;
import com.quotaapp.backend.model.Province;
import com.quotaapp.backend.model.Role;
import com.quotaapp.backend.model.StationFuelType;
import com.quotaapp.backend.model.StationOwner;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.repository.primary.FuelStationRepository;
import com.quotaapp.backend.repository.primary.FuelTypeEntityRepository;
import com.quotaapp.backend.repository.primary.ProvinceRepository;
import com.quotaapp.backend.repository.primary.DistrictRepository;
import com.quotaapp.backend.repository.primary.StationFuelTypeRepository;
import com.quotaapp.backend.repository.primary.StationOwnerRepository;
import com.quotaapp.backend.repository.primary.UserRepository;
import com.quotaapp.backend.service.EmailService;
import com.quotaapp.backend.service.SessionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for station owner registration
 */
@RestController
@RequestMapping("/api/auth/register")
@RequiredArgsConstructor
@Slf4j
public class StationRegistrationController {

    private final UserRepository userRepository;
    private final StationOwnerRepository stationOwnerRepository;
    private final FuelStationRepository fuelStationRepository;
    private final FuelTypeEntityRepository fuelTypeEntityRepository;
    private final StationFuelTypeRepository stationFuelTypeRepository;
    private final ProvinceRepository provinceRepository;
    private final DistrictRepository districtRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SessionService sessionService;

    /**
     * Register a new station owner
     *
     * @param request the registration request
     * @return success response with the registered user
     */
    @PostMapping("/station")
    public ResponseEntity<ApiResponse<User>> registerStationOwner(@Valid @RequestBody StationRegistrationRequestDTO request) {
        log.info("Registering new station owner with email: {}", request.getEmail());

        // Check if email is already registered with a completed registration
        // This distinguishes between temporary users created for email verification
        // and fully registered users with station owner records
        if (userRepository.existsByEmail(request.getEmail())) {
            // Check if this is a temporary user created during email verification
            // or a fully registered user with a station owner record
            boolean hasStationOwner = false;
            User existingUser = userRepository.findByEmail(request.getEmail()).orElse(null);

            if (existingUser != null) {
                // Check if the user has a station owner record
                hasStationOwner = stationOwnerRepository.findByUser(existingUser).isPresent();
            }

            if (hasStationOwner) {
                log.warn("Email {} is already registered with a completed registration", request.getEmail());
                return ResponseEntity.badRequest().body(ApiResponse.error("Email is already registered. Please use the login page."));
            }

            // If it's a temporary user without a station owner record, we'll update it below
            log.info("Found temporary user for email: {}. Will update with complete registration data.", request.getEmail());
        }

        // Check if NIC number is already in use
        if (stationOwnerRepository.existsByNicNumber(request.getNicNumber())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("NIC number is already in use"));
        }

        // Check if business registration number is already in use
        if (fuelStationRepository.existsByBusinessRegistrationNumber(request.getBusiness().getBusinessRegistrationNumber())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Business registration number is already in use"));
        }

        // Check if fuel retail license number is already in use
        if (fuelStationRepository.existsByFuelRetailLicenseNumber(request.getBusiness().getFuelRetailLicenseNumber())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Fuel retail license number is already in use"));
        }

        try {
            // Find existing user or create a new one
            User user = userRepository.findByEmail(request.getEmail())
                    .map(existingUser -> {
                        // Update existing user (likely a temporary user created during email verification)
                        existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
                        existingUser.setRole(Role.STATION_OWNER);
                        existingUser.setActive(false); // Account needs to be verified by admin
                        existingUser.setUpdatedAt(LocalDateTime.now());
                        return existingUser;
                    })
                    .orElseGet(() -> {
                        // Create new user if not found
                        return User.builder()
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(Role.STATION_OWNER)
                                .isActive(false) // Account needs to be verified by admin
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build();
                    });

            user = userRepository.save(user);

            // Create station owner
            StationOwner stationOwner = StationOwner.builder()
                    .user(user)
                    .fullName(request.getFullName())
                    .nicNumber(request.getNicNumber())
                    .contactNumber(request.getContactNumber())
                    .build();

            stationOwner = stationOwnerRepository.save(stationOwner);

            // Parse time strings to LocalTime
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
            LocalTime openingTime = LocalTime.parse(request.getBusiness().getOpeningTime(), timeFormatter);
            LocalTime closingTime = LocalTime.parse(request.getBusiness().getClosingTime(), timeFormatter);

            // Get fuel types
            Set<FuelTypeEntity> fuelTypeEntities = new HashSet<>();
            for (String fuelTypeName : request.getBusiness().getFuelTypes()) {
                FuelType fuelType = FuelType.fromDisplayName(fuelTypeName);
                if (fuelType != null) {
                    FuelTypeEntity fuelTypeEntity = fuelTypeEntityRepository.findByFuelType(fuelType)
                            .orElseGet(() -> {
                                FuelTypeEntity newEntity = FuelTypeEntity.builder()
                                        .fuelType(fuelType)
                                        .build();
                                return fuelTypeEntityRepository.save(newEntity);
                            });
                    fuelTypeEntities.add(fuelTypeEntity);
                }
            }

            // Get province and district from the database
            Province province = provinceRepository.findByName(request.getBusiness().getProvince())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid province: " + request.getBusiness().getProvince()));

            District district = districtRepository.findByNameAndProvince(request.getBusiness().getDistrict(), province)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid district: " + request.getBusiness().getDistrict()));

            // Create fuel station
            FuelStation fuelStation = FuelStation.builder()
                    .owner(stationOwner)
                    .businessRegistrationNumber(request.getBusiness().getBusinessRegistrationNumber())
                    .businessName(request.getBusiness().getBusinessName())
                    .businessAddress(request.getBusiness().getBusinessAddress())
                    .province(province)
                    .provinceName(request.getBusiness().getProvince())
                    .district(district)
                    .districtName(request.getBusiness().getDistrict())
                    .stationName(request.getBusiness().getStationName())
                    .openingTime(openingTime)
                    .closingTime(closingTime)
                    .fuelRetailLicenseNumber(request.getBusiness().getFuelRetailLicenseNumber())
                    .isActive(true)
                    .verificationStatus("PENDING") // Needs to be verified by admin
                    .build();

            fuelStation = fuelStationRepository.save(fuelStation);

            // Create station fuel types
            for (FuelTypeEntity fuelTypeEntity : fuelTypeEntities) {
                StationFuelType stationFuelType = StationFuelType.builder()
                        .station(fuelStation)
                        .fuelType(fuelTypeEntity.getFuelType())
                        .fuelTypeEntity(fuelTypeEntity) // Set the fuel type entity for the foreign key
                        .unitPrice(new BigDecimal("0.01")) // Minimum positive value, will be updated by admin
                        .isAvailable(true)
                        .build();

                stationFuelTypeRepository.save(stationFuelType);
            }

            // Send registration confirmation email
            emailService.sendRegistrationConfirmationEmail(user.getUsername(), stationOwner.getFullName());

            // Clear session data
            sessionService.clearRegistrationData();

            return ResponseEntity.ok(ApiResponse.success("Station owner registered successfully. Your account will be verified by an administrator.", user));
        } catch (IllegalArgumentException e) {
            // Handle specific validation errors like invalid province or district
            log.error("Validation error during station owner registration: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error registering station owner", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Registration failed: " + e.getMessage()));
        }
    }
}
