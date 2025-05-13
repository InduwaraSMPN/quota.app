package com.quotaapp.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.dto.signup.EmailVerificationDTO;
import com.quotaapp.backend.dto.signup.LoginInfoDTO;
import com.quotaapp.backend.dto.signup.OwnerInfoDTO;
import com.quotaapp.backend.dto.signup.PasswordSetupDTO;
import com.quotaapp.backend.dto.signup.VehicleInfoDTO;
import com.quotaapp.backend.exception.InvalidRegistrationDataException;
import com.quotaapp.backend.exception.InvalidVerificationCodeException;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.service.EmailVerificationService;
import com.quotaapp.backend.service.RegistrationService;
import com.quotaapp.backend.service.SessionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/auth/register")
@RequiredArgsConstructor
@Slf4j
public class RegistrationController {

    private final RegistrationService registrationService;
    private final EmailVerificationService emailVerificationService;
    private final SessionService sessionService;

    /**
     * Step 1: Process login information
     *
     * @param loginInfoDTO the login information
     * @return the response
     */
    @PostMapping("/step1")
    public ResponseEntity<ApiResponse<String>> processStep1(@Valid @RequestBody LoginInfoDTO loginInfoDTO) {
        log.info("Processing registration step 1 for email: {}", loginInfoDTO.getEmail());

        try {
            // Validate the login information
            List<String> errors = registrationService.processStep1(loginInfoDTO);

            if (!errors.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Validation failed", errors));
            }

            // Store the login information in the session
            sessionService.storeLoginInfo(loginInfoDTO);

            // Send verification code
            boolean sent = emailVerificationService.sendVerificationCode(loginInfoDTO.getEmail());

            if (!sent) {
                return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to send verification code"));
            }

            return ResponseEntity.ok(ApiResponse.success("Login information validated and verification code sent"));
        } catch (Exception e) {
            log.error("Error processing step 1 for email: {}", loginInfoDTO.getEmail(), e);
            // Provide more detailed error message for debugging
            String errorMessage = "An error occurred during step 1: " + e.getMessage();
            if (e.getCause() != null) {
                errorMessage += " - Caused by: " + e.getCause().getMessage();
            }
            return ResponseEntity.internalServerError().body(ApiResponse.error(errorMessage));
        }
    }

    /**
     * Verify email
     *
     * @param verificationDTO the verification data
     * @return the response
     */
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@Valid @RequestBody EmailVerificationDTO verificationDTO) {
        log.info("Verifying email for: {}", verificationDTO.getEmail());

        try {
            // Verify the code
            boolean verified = emailVerificationService.verifyCode(verificationDTO.getEmail(), verificationDTO.getVerificationCode());

            if (!verified) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Invalid verification code"));
            }

            // Mark email as verified in the session
            sessionService.setEmailVerified(true);

            return ResponseEntity.ok(ApiResponse.success("Email verified successfully"));
        } catch (InvalidVerificationCodeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Resend verification code
     *
     * @param loginInfoDTO the login information
     * @return the response
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<String>> resendVerification(@Valid @RequestBody LoginInfoDTO loginInfoDTO) {
        log.info("Resending verification code for email: {}", loginInfoDTO.getEmail());

        // Send verification code
        boolean sent = emailVerificationService.sendVerificationCode(loginInfoDTO.getEmail());

        if (!sent) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to send verification code"));
        }

        return ResponseEntity.ok(ApiResponse.success("Verification code sent"));
    }

    /**
     * Step 2: Process password setup
     *
     * @param passwordSetupDTO the password setup information
     * @return the response
     */
    @PostMapping("/step2")
    public ResponseEntity<ApiResponse<String>> processStep2(@Valid @RequestBody PasswordSetupDTO passwordSetupDTO) {
        log.info("Processing registration step 2 (password setup)");

        // Validate the password
        if (!passwordSetupDTO.getPassword().equals(passwordSetupDTO.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Passwords do not match"));
        }

        // Store the password in the session
        sessionService.storePassword(passwordSetupDTO);

        return ResponseEntity.ok(ApiResponse.success("Password setup completed"));
    }

    /**
     * Step 3: Process owner information
     *
     * @param ownerInfoDTO the owner information
     * @return the response
     */
    @PostMapping("/step3")
    public ResponseEntity<ApiResponse<String>> processStep3(@Valid @RequestBody OwnerInfoDTO ownerInfoDTO) {
        log.info("Processing registration step 3 for owner: {}", ownerInfoDTO.getFullName());

        // Validate the owner information
        List<String> errors = registrationService.processStep2(ownerInfoDTO);

        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Validation failed", errors));
        }

        // Store the owner information in the session
        sessionService.storeOwnerInfo(ownerInfoDTO);

        return ResponseEntity.ok(ApiResponse.success("Owner information validated"));
    }

    /**
     * Step 4: Process vehicle information and complete registration
     *
     * @param vehicleInfoDTO the vehicle information
     * @return the response
     */
    @PostMapping("/step4")
    public ResponseEntity<ApiResponse<String>> processStep4(@Valid @RequestBody VehicleInfoDTO vehicleInfoDTO) {
        log.info("Processing registration step 4 for vehicle: {}", vehicleInfoDTO.getRegistrationNumber());

        // Get the owner information from the session
        OwnerInfoDTO ownerInfoDTO = sessionService.getOwnerInfo();

        if (ownerInfoDTO == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Owner information not found. Please complete step 3 first."));
        }

        // Validate the vehicle information
        List<String> errors = registrationService.processStep3(vehicleInfoDTO, ownerInfoDTO);

        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Validation failed", errors));
        }

        // Store the vehicle information in the session
        sessionService.storeVehicleInfo(vehicleInfoDTO);

        try {
            // Complete the registration
            User user = registrationService.completeRegistration(
                    sessionService.getLoginInfo(),
                    sessionService.getPassword(),
                    ownerInfoDTO,
                    vehicleInfoDTO,
                    sessionService.isEmailVerified()
            );

            // Clear the session data
            sessionService.clearRegistrationData();

            log.info("Registration completed successfully for user: {}", user.getEmail());
            return ResponseEntity.ok(ApiResponse.success("Registration completed successfully"));
        } catch (InvalidRegistrationDataException e) {
            log.warn("Invalid registration data: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error completing registration", e);
            // Provide more detailed error message for debugging
            String errorMessage = "An error occurred during registration: " + e.getMessage();
            if (e.getCause() != null) {
                errorMessage += " - Caused by: " + e.getCause().getMessage();
            }
            return ResponseEntity.internalServerError().body(ApiResponse.error(errorMessage));
        }
    }

    /**
     * Complete vehicle owner registration in one step
     * This endpoint is used by the frontend to submit all registration data at once
     *
     * @param requestBody the complete registration data
     * @return the response
     */
    @PostMapping("/vehicle")
    public ResponseEntity<ApiResponse<String>> registerVehicleOwner(@Valid @RequestBody Map<String, Object> requestBody) {
        log.info("Processing complete vehicle owner registration");

        try {
            // Extract data from the request
            String email = (String) requestBody.get("email");
            String password = (String) requestBody.get("password");
            String fullName = (String) requestBody.get("fullName");
            String nicNumber = (String) requestBody.get("nicNumber");
            String address = (String) requestBody.get("address");
            String contactNumber = (String) requestBody.get("contactNumber");

            @SuppressWarnings("unchecked")
            Map<String, Object> vehicleData = (Map<String, Object>) requestBody.get("vehicle");

            if (email == null || password == null || fullName == null || nicNumber == null ||
                address == null || contactNumber == null || vehicleData == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Missing required fields"));
            }

            // Create DTOs
            LoginInfoDTO loginInfoDTO = new LoginInfoDTO();
            loginInfoDTO.setEmail(email);

            PasswordSetupDTO passwordSetupDTO = new PasswordSetupDTO();
            passwordSetupDTO.setPassword(password);
            passwordSetupDTO.setConfirmPassword(password);

            OwnerInfoDTO ownerInfoDTO = new OwnerInfoDTO();
            ownerInfoDTO.setFullName(fullName);
            ownerInfoDTO.setNicNumber(nicNumber);
            ownerInfoDTO.setAddress(address);
            ownerInfoDTO.setContactNumber(contactNumber);

            VehicleInfoDTO vehicleInfoDTO = new VehicleInfoDTO();
            vehicleInfoDTO.setRegistrationNumber((String) vehicleData.get("registrationNumber"));
            vehicleInfoDTO.setEngineNumber((String) vehicleData.get("engineNumber"));
            vehicleInfoDTO.setChassisNumber((String) vehicleData.get("chassisNumber"));
            vehicleInfoDTO.setMake((String) vehicleData.get("make"));
            vehicleInfoDTO.setModel((String) vehicleData.get("model"));

            // Handle numeric fields
            try {
                vehicleInfoDTO.setYearOfManufacture(Integer.parseInt(vehicleData.get("yearOfManufacture").toString()));
                vehicleInfoDTO.setEngineCapacity(Integer.parseInt(vehicleData.get("engineCapacity").toString()));
                vehicleInfoDTO.setGrossVehicleWeight(Integer.parseInt(vehicleData.get("grossVehicleWeight").toString()));
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Invalid numeric values in vehicle data"));
            }

            vehicleInfoDTO.setVehicleClass((String) vehicleData.get("vehicleClass"));
            vehicleInfoDTO.setTypeOfBody((String) vehicleData.get("typeOfBody"));
            vehicleInfoDTO.setFuelType((String) vehicleData.get("fuelType"));
            vehicleInfoDTO.setColor((String) vehicleData.get("color"));

            // Parse date
            try {
                String dateStr = (String) vehicleData.get("dateOfFirstRegistration");
                vehicleInfoDTO.setDateOfFirstRegistration(LocalDate.parse(dateStr));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Invalid date format for dateOfFirstRegistration"));
            }

            vehicleInfoDTO.setCountryOfOrigin((String) vehicleData.get("countryOfOrigin"));

            // Validate login info
            List<String> loginErrors = registrationService.processStep1(loginInfoDTO);
            if (!loginErrors.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Login information validation failed", loginErrors));
            }

            // Validate owner info
            List<String> ownerErrors = registrationService.processStep2(ownerInfoDTO);
            if (!ownerErrors.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Owner information validation failed", ownerErrors));
            }

            // Validate vehicle info
            List<String> vehicleErrors = registrationService.processStep3(vehicleInfoDTO, ownerInfoDTO);
            if (!vehicleErrors.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Vehicle information validation failed", vehicleErrors));
            }

            // Complete registration
            registrationService.completeRegistration(
                loginInfoDTO,
                passwordSetupDTO,
                ownerInfoDTO,
                vehicleInfoDTO,
                true // Assume email is verified since we've already validated with DMT
            );

            return ResponseEntity.ok(ApiResponse.success("Registration completed successfully"));

        } catch (Exception e) {
            log.error("Error processing vehicle owner registration", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("An unexpected error occurred during registration. Please try again later."));
        }
    }
}
