package com.quotaapp.backend.controller;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.dto.mobile.MobileStationRegistrationDTO;
import com.quotaapp.backend.dto.mobile.MobileLoginRequestDTO;
import com.quotaapp.backend.dto.mobile.MobileLoginResponseDTO;
import com.quotaapp.backend.model.*;
import com.quotaapp.backend.repository.primary.*;
import com.quotaapp.backend.service.EmailService;
import com.quotaapp.backend.service.NotificationService;
import com.quotaapp.backend.service.SmsService;
import com.quotaapp.backend.security.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Mobile Registration Controller for station owners
 * Simplified registration process optimized for mobile UX
 */
@RestController
@RequestMapping("/api/mobile/auth")
@RequiredArgsConstructor
@Slf4j
public class MobileRegistrationController {

    private final UserRepository userRepository;
    private final StationOwnerRepository stationOwnerRepository;
    private final FuelStationRepository fuelStationRepository;
    private final FuelTypeEntityRepository fuelTypeEntityRepository;
    private final StationFuelTypeRepository stationFuelTypeRepository;
    private final ProvinceRepository provinceRepository;
    private final DistrictRepository districtRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final SmsService smsService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;

    /**
     * Mobile station owner registration (simplified single-step process)
     */
    @PostMapping("/register/station")
    public ResponseEntity<ApiResponse<MobileLoginResponseDTO>> registerStationOwner(
            @Valid @RequestBody MobileStationRegistrationDTO request) {

        log.info("Mobile registration for station owner: {}", request.getEmail());

        try {
            // Check if email is already registered
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Email is already registered"));
            }

            // Check if NIC number is already in use
            if (stationOwnerRepository.existsByNicNumber(request.getNicNumber())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("NIC number is already in use"));
            }

            // Check if business registration number is already in use
            if (fuelStationRepository.existsByBusinessRegistrationNumber(request.getBusinessRegistrationNumber())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Business registration number is already in use"));
            }

            // Find province and district
            Province province = provinceRepository.findByName(request.getProvince())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid province: " + request.getProvince()));

            District district = districtRepository.findByNameAndProvince(request.getDistrict(), province)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid district: " + request.getDistrict()));

            // Create user
            User user = User.builder()
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(Role.STATION_OWNER)
                    .isActive(false) // Account needs admin verification
                    .emailVerified(false) // Will be verified later
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            user = userRepository.save(user);

            // Create station owner
            StationOwner stationOwner = StationOwner.builder()
                    .user(user)
                    .fullName(request.getFullName())
                    .nicNumber(request.getNicNumber())
                    .contactNumber(request.getContactNumber())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            stationOwner = stationOwnerRepository.save(stationOwner);

            // Create fuel station
            FuelStation fuelStation = FuelStation.builder()
                    .owner(stationOwner)
                    .stationName(request.getStationName())
                    .businessName(request.getBusinessName())
                    .businessAddress(request.getBusinessAddress())
                    .businessRegistrationNumber(request.getBusinessRegistrationNumber())
                    .fuelRetailLicenseNumber(request.getFuelRetailLicenseNumber())
                    .openingTime(LocalTime.parse(request.getOpeningTime()))
                    .closingTime(LocalTime.parse(request.getClosingTime()))
                    .province(province)
                    .district(district)
                    .verificationStatus("PENDING")
                    .isActive(false) // Will be activated after verification
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            fuelStation = fuelStationRepository.save(fuelStation);

            // Add default fuel types
            List<FuelTypeEntity> defaultFuelTypes = fuelTypeEntityRepository.findAll();
            for (FuelTypeEntity fuelTypeEntity : defaultFuelTypes) {
                StationFuelType stationFuelType = StationFuelType.builder()
                        .station(fuelStation)
                        .fuelType(fuelTypeEntity.getFuelType())
                        .fuelTypeEntity(fuelTypeEntity)
                        .unitPrice(new BigDecimal("0.01")) // Default price, will be updated by admin
                        .isAvailable(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();

                stationFuelTypeRepository.save(stationFuelType);
            }

            // Send registration confirmation email
            try {
                emailService.sendRegistrationConfirmationEmail(user.getEmail(), stationOwner.getFullName());
            } catch (Exception e) {
                log.warn("Failed to send registration confirmation email: {}", e.getMessage());
            }

            // Send SMS notification if phone number is provided
            if (request.getContactNumber() != null && !request.getContactNumber().isEmpty()) {
                try {
                    smsService.sendSms(user, "+94" + request.getContactNumber(),
                        "quota.app: Registration successful! Your account is pending admin verification.");
                } catch (Exception e) {
                    log.warn("Failed to send registration SMS: {}", e.getMessage());
                }
            }

            // Create notification for the user
            try {
                notificationService.createUserNotification(user.getId(),
                    "Registration Successful",
                    "Your station registration is pending admin verification.",
                    "REGISTRATION");
            } catch (Exception e) {
                log.warn("Failed to create registration notification: {}", e.getMessage());
            }

            // Generate JWT token for immediate login (even though account is inactive)
            String token = jwtTokenUtil.generateToken(user.getEmail());

            MobileLoginResponseDTO response = MobileLoginResponseDTO.builder()
                    .token(token)
                    .user(MobileLoginResponseDTO.UserInfo.builder()
                            .id(user.getId())
                            .email(user.getEmail())
                            .role(user.getRole().name())
                            .isActive(user.isActive())
                            .build())
                    .stationOwner(MobileLoginResponseDTO.StationOwnerInfo.builder()
                            .id(stationOwner.getId())
                            .fullName(stationOwner.getFullName())
                            .contactNumber(stationOwner.getContactNumber())
                            .build())
                    .station(MobileLoginResponseDTO.StationInfo.builder()
                            .id(fuelStation.getId())
                            .stationName(fuelStation.getStationName())
                            .verificationStatus(fuelStation.getVerificationStatus())
                            .isActive(fuelStation.isActive())
                            .build())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Registration successful. Your account is pending admin verification.", response));

        } catch (IllegalArgumentException e) {
            log.error("Validation error during mobile registration: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error during mobile station registration", e);
            return ResponseEntity.status(500).body(ApiResponse.error("Registration failed: " + e.getMessage()));
        }
    }

    /**
     * Mobile login endpoint
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<MobileLoginResponseDTO>> login(@Valid @RequestBody MobileLoginRequestDTO request) {
        log.info("Mobile login attempt for: {}", request.getEmail());

        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Find user
            Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body(ApiResponse.error("Invalid credentials"));
            }

            User user = userOpt.get();

            // Check if user is a station owner
            if (!user.getRole().equals(Role.STATION_OWNER)) {
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Station owner account required."));
            }

            // Find station owner
            Optional<StationOwner> stationOwnerOpt = stationOwnerRepository.findByUser(user);
            if (stationOwnerOpt.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("Station owner profile not found"));
            }

            StationOwner stationOwner = stationOwnerOpt.get();

            // Find station
            List<FuelStation> stations = fuelStationRepository.findByOwner(stationOwner);
            FuelStation station = stations.isEmpty() ? null : stations.get(0);

            // Update last login
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            // Generate JWT token
            String token = jwtTokenUtil.generateToken(user.getEmail());

            MobileLoginResponseDTO response = MobileLoginResponseDTO.builder()
                    .token(token)
                    .user(MobileLoginResponseDTO.UserInfo.builder()
                            .id(user.getId())
                            .email(user.getEmail())
                            .role(user.getRole().name())
                            .isActive(user.isActive())
                            .build())
                    .stationOwner(MobileLoginResponseDTO.StationOwnerInfo.builder()
                            .id(stationOwner.getId())
                            .fullName(stationOwner.getFullName())
                            .contactNumber(stationOwner.getContactNumber())
                            .build())
                    .station(station != null ? MobileLoginResponseDTO.StationInfo.builder()
                            .id(station.getId())
                            .stationName(station.getStationName())
                            .verificationStatus(station.getVerificationStatus())
                            .isActive(station.isActive())
                            .build() : null)
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Login successful", response));

        } catch (Exception e) {
            log.error("Mobile login failed for {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid credentials"));
        }
    }

    /**
     * Get all provinces for mobile registration
     */
    @GetMapping("/provinces")
    public ResponseEntity<ApiResponse<List<String>>> getProvinces() {
        try {
            List<String> provinces = provinceRepository.findAll()
                    .stream()
                    .map(Province::getName)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("Provinces retrieved successfully", provinces));
        } catch (Exception e) {
            log.error("Error retrieving provinces", e);
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to retrieve provinces"));
        }
    }

    /**
     * Get districts for a specific province
     */
    @GetMapping("/districts/{provinceName}")
    public ResponseEntity<ApiResponse<List<String>>> getDistricts(@PathVariable String provinceName) {
        try {
            Optional<Province> provinceOpt = provinceRepository.findByName(provinceName);
            if (provinceOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Invalid province name"));
            }

            List<String> districts = districtRepository.findByProvince(provinceOpt.get())
                    .stream()
                    .map(District::getName)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("Districts retrieved successfully", districts));
        } catch (Exception e) {
            log.error("Error retrieving districts for province: {}", provinceName, e);
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to retrieve districts"));
        }
    }
}
