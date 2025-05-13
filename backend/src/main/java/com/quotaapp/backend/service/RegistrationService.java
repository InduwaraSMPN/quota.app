package com.quotaapp.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.quotaapp.backend.dto.signup.DMTValidationDTO;
import com.quotaapp.backend.dto.signup.LoginInfoDTO;
import com.quotaapp.backend.dto.signup.OwnerInfoDTO;
import com.quotaapp.backend.dto.signup.PasswordSetupDTO;
import com.quotaapp.backend.dto.signup.VehicleInfoDTO;
import com.quotaapp.backend.exception.InvalidRegistrationDataException;
import com.quotaapp.backend.model.FuelType;
import com.quotaapp.backend.model.Role;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.model.Vehicle;
import com.quotaapp.backend.model.VehicleClass;
import com.quotaapp.backend.model.VehicleOwner;
import com.quotaapp.backend.model.dmt.DMTVehicleRecord;
import com.quotaapp.backend.repository.primary.UserRepository;
import com.quotaapp.backend.repository.primary.VehicleClassRepository;
import com.quotaapp.backend.repository.primary.VehicleOwnerRepository;
import com.quotaapp.backend.repository.primary.VehicleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationService {

    private final UserRepository userRepository;
    private final VehicleOwnerRepository vehicleOwnerRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleClassRepository vehicleClassRepository;
    private final DMTValidationService dmtValidationService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Process step 1 of registration (login information)
     *
     * @param loginInfoDTO the login information
     * @return a list of validation errors, empty if validation is successful
     */
    @Transactional(readOnly = true)
    public List<String> processStep1(LoginInfoDTO loginInfoDTO) {
        List<String> errors = new ArrayList<>();

        // Check if email is already registered
        if (userRepository.existsByEmail(loginInfoDTO.getEmail())) {
            errors.add("Email is already registered");
        }

        return errors;
    }

    /**
     * Process step 2 of registration (owner information)
     *
     * @param ownerInfoDTO the owner information
     * @return a list of validation errors, empty if validation is successful
     */
    @Transactional(readOnly = true)
    public List<String> processStep2(OwnerInfoDTO ownerInfoDTO) {
        List<String> errors = new ArrayList<>();

        // Check if NIC is already registered
        if (vehicleOwnerRepository.existsByNicNumber(ownerInfoDTO.getNicNumber())) {
            errors.add("NIC number is already registered");
        }

        return errors;
    }

    /**
     * Process step 3 of registration (vehicle information)
     *
     * @param vehicleInfoDTO the vehicle information
     * @param ownerInfoDTO the owner information
     * @return a list of validation errors, empty if validation is successful
     */
    @Transactional(readOnly = true)
    public List<String> processStep3(VehicleInfoDTO vehicleInfoDTO, OwnerInfoDTO ownerInfoDTO) {
        List<String> errors = new ArrayList<>();

        // Check if vehicle class exists
        if (!vehicleClassRepository.existsByCode(vehicleInfoDTO.getVehicleClass())) {
            errors.add("Invalid vehicle class");
        }

        // Check if registration number is already registered
        if (vehicleRepository.existsByRegistrationNumber(vehicleInfoDTO.getRegistrationNumber())) {
            errors.add("Vehicle with this registration number is already registered");
        }

        // Check if chassis number is already registered
        if (vehicleRepository.existsByChassisNumber(vehicleInfoDTO.getChassisNumber())) {
            errors.add("Vehicle with this chassis number is already registered");
        }

        // Validate against DMT database
        DMTValidationDTO validationDTO = DMTValidationDTO.builder()
                .registrationNumber(vehicleInfoDTO.getRegistrationNumber())
                .engineNumber(vehicleInfoDTO.getEngineNumber())
                .chassisNumber(vehicleInfoDTO.getChassisNumber())
                .ownerNIC(ownerInfoDTO.getNicNumber())
                .ownerName(ownerInfoDTO.getFullName())
                .build();

        List<String> dmtValidationErrors = dmtValidationService.validateVehicleInformation(validationDTO);
        errors.addAll(dmtValidationErrors);

        return errors;
    }

    /**
     * Complete the registration process
     *
     * @param loginInfoDTO the login information
     * @param passwordSetupDTO the password setup information
     * @param ownerInfoDTO the owner information
     * @param vehicleInfoDTO the vehicle information
     * @param emailVerified whether the email is verified
     * @return the created user
     */
    @Transactional
    public User completeRegistration(
            LoginInfoDTO loginInfoDTO,
            PasswordSetupDTO passwordSetupDTO,
            OwnerInfoDTO ownerInfoDTO,
            VehicleInfoDTO vehicleInfoDTO,
            boolean emailVerified) {

        // Validate all data is present
        if (loginInfoDTO == null || passwordSetupDTO == null || ownerInfoDTO == null || vehicleInfoDTO == null) {
            throw new InvalidRegistrationDataException("Registration data is incomplete");
        }

        // Validate email is verified
        if (!emailVerified) {
            log.warn("Attempted to complete registration with unverified email: {}", loginInfoDTO.getEmail());
            throw new InvalidRegistrationDataException("Email must be verified before registration. Please complete the email verification step.");
        }

        // Create or update the user
        User user = userRepository.findByEmail(loginInfoDTO.getEmail())
                .orElseGet(() -> User.builder()
                        .email(loginInfoDTO.getEmail())
                        .build());

        user.setPassword(passwordEncoder.encode(passwordSetupDTO.getPassword()));
        user.setRole(Role.VEHICLE_OWNER);
        user.setEmailVerified(emailVerified); // Use the parameter value instead of hardcoding true
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // Create the vehicle owner
        VehicleOwner vehicleOwner = VehicleOwner.builder()
                .user(savedUser)
                .fullName(ownerInfoDTO.getFullName())
                .nicNumber(ownerInfoDTO.getNicNumber())
                .address(ownerInfoDTO.getAddress())
                .contactNumber(ownerInfoDTO.getContactNumber())
                .build();

        VehicleOwner savedVehicleOwner = vehicleOwnerRepository.save(vehicleOwner);

        // Get the vehicle class
        Optional<VehicleClass> vehicleClassOpt = vehicleClassRepository.findByCode(vehicleInfoDTO.getVehicleClass());
        if (vehicleClassOpt.isEmpty()) {
            throw new InvalidRegistrationDataException("Invalid vehicle class");
        }

        VehicleClass vehicleClass = vehicleClassOpt.get();

        // Create the vehicle
        Vehicle vehicle = Vehicle.builder()
                .owner(savedVehicleOwner)
                .registrationNumber(vehicleInfoDTO.getRegistrationNumber().replaceAll("-", "").toUpperCase())
                .engineNumber(vehicleInfoDTO.getEngineNumber())
                .chassisNumber(vehicleInfoDTO.getChassisNumber())
                .make(vehicleInfoDTO.getMake())
                .model(vehicleInfoDTO.getModel())
                .yearOfManufacture(vehicleInfoDTO.getYearOfManufacture())
                .vehicleClass(vehicleClass)
                .typeOfBody(vehicleInfoDTO.getTypeOfBody())
                .fuelType(FuelType.valueOf(vehicleInfoDTO.getFuelType()))
                .engineCapacity(vehicleInfoDTO.getEngineCapacity())
                .color(vehicleInfoDTO.getColor())
                .grossVehicleWeight(vehicleInfoDTO.getGrossVehicleWeight())
                .dateOfFirstRegistration(vehicleInfoDTO.getDateOfFirstRegistration())
                .countryOfOrigin(vehicleInfoDTO.getCountryOfOrigin())
                .build();

        vehicleRepository.save(vehicle);

        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), vehicleOwner.getFullName());

        log.info("Registration completed for user: {}", user.getEmail());
        return savedUser;
    }
}
