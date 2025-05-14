package com.quotaapp.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.dto.signup.BusinessInfoDTO;
import com.quotaapp.backend.dto.signup.EmailVerificationDTO;
import com.quotaapp.backend.dto.signup.LoginInfoDTO;
import com.quotaapp.backend.dto.signup.OwnerInfoDTO;
import com.quotaapp.backend.dto.signup.PasswordSetupDTO;
import com.quotaapp.backend.dto.signup.RegistrationSessionDTO;
import com.quotaapp.backend.dto.signup.StationOwnerInfoDTO;
import com.quotaapp.backend.dto.signup.VehicleInfoDTO;
import com.quotaapp.backend.service.SessionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for managing session data during the registration process
 */
@RestController
@RequestMapping("/api/session")
@RequiredArgsConstructor
@Slf4j
public class SessionController {

    private final SessionService sessionService;

    /**
     * Get all registration data from the session
     *
     * @return the registration data
     */
    @GetMapping("/registration-data")
    public ResponseEntity<ApiResponse<RegistrationSessionDTO>> getRegistrationData() {
        log.info("Retrieving registration data from session");

        RegistrationSessionDTO sessionData = RegistrationSessionDTO.builder()
                .loginInfo(sessionService.getLoginInfo())
                .passwordSetup(sessionService.getPassword())
                .ownerInfo(sessionService.getOwnerInfo())
                .vehicleInfo(sessionService.getVehicleInfo())
                .stationOwnerInfo(sessionService.getStationOwnerInfo())
                .businessInfo(sessionService.getBusinessInfo())
                .emailVerified(sessionService.isEmailVerified())
                .currentStep(sessionService.getCurrentStep())
                .build();

        return ResponseEntity.ok(ApiResponse.success("Registration data retrieved", sessionData));
    }

    /**
     * Update registration data in the session
     *
     * @param sessionData the registration data to update
     * @return success response
     */
    @PutMapping("/registration-data")
    public ResponseEntity<ApiResponse<String>> updateRegistrationData(@Valid @RequestBody RegistrationSessionDTO sessionData) {
        log.info("Updating registration data in session");

        // Update each component of the session data if provided
        if (sessionData.getLoginInfo() != null) {
            sessionService.storeLoginInfo(sessionData.getLoginInfo());
        }

        if (sessionData.getPasswordSetup() != null) {
            sessionService.storePassword(sessionData.getPasswordSetup());
        }

        if (sessionData.getOwnerInfo() != null) {
            sessionService.storeOwnerInfo(sessionData.getOwnerInfo());
        }

        if (sessionData.getVehicleInfo() != null) {
            sessionService.storeVehicleInfo(sessionData.getVehicleInfo());
        }

        if (sessionData.getStationOwnerInfo() != null) {
            sessionService.storeStationOwnerInfo(sessionData.getStationOwnerInfo());
        }

        if (sessionData.getBusinessInfo() != null) {
            sessionService.storeBusinessInfo(sessionData.getBusinessInfo());
        }

        if (sessionData.getEmailVerified() != null) {
            sessionService.setEmailVerified(sessionData.getEmailVerified());
        }

        if (sessionData.getCurrentStep() != null) {
            sessionService.setCurrentStep(sessionData.getCurrentStep());
        }

        return ResponseEntity.ok(ApiResponse.success("Registration data updated successfully"));
    }

    /**
     * Clear all registration data from the session
     *
     * @return success response
     */
    @DeleteMapping("/registration-data")
    public ResponseEntity<ApiResponse<String>> clearRegistrationData() {
        log.info("Clearing registration data from session");

        sessionService.clearRegistrationData();

        return ResponseEntity.ok(ApiResponse.success("Registration data cleared successfully"));
    }

    /**
     * Update login information in the session
     *
     * @param loginInfo the login information
     * @return success response
     */
    @PutMapping("/login-info")
    public ResponseEntity<ApiResponse<String>> updateLoginInfo(@Valid @RequestBody LoginInfoDTO loginInfo) {
        log.info("Updating login info in session for email: {}", loginInfo.getEmail());

        sessionService.storeLoginInfo(loginInfo);

        return ResponseEntity.ok(ApiResponse.success("Login information updated successfully"));
    }

    /**
     * Update password in the session
     *
     * @param passwordSetup the password setup information
     * @return success response
     */
    @PutMapping("/password")
    public ResponseEntity<ApiResponse<String>> updatePassword(@Valid @RequestBody PasswordSetupDTO passwordSetup) {
        log.info("Updating password in session");

        sessionService.storePassword(passwordSetup);

        return ResponseEntity.ok(ApiResponse.success("Password updated successfully"));
    }

    /**
     * Update owner information in the session
     *
     * @param ownerInfo the owner information
     * @return success response
     */
    @PutMapping("/owner-info")
    public ResponseEntity<ApiResponse<String>> updateOwnerInfo(@Valid @RequestBody OwnerInfoDTO ownerInfo) {
        log.info("Updating owner info in session for: {}", ownerInfo.getFullName());

        sessionService.storeOwnerInfo(ownerInfo);

        return ResponseEntity.ok(ApiResponse.success("Owner information updated successfully"));
    }

    /**
     * Update vehicle information in the session
     *
     * @param vehicleInfo the vehicle information
     * @return success response
     */
    @PutMapping("/vehicle-info")
    public ResponseEntity<ApiResponse<String>> updateVehicleInfo(@Valid @RequestBody VehicleInfoDTO vehicleInfo) {
        log.info("Updating vehicle info in session for: {}", vehicleInfo.getRegistrationNumber());

        sessionService.storeVehicleInfo(vehicleInfo);

        return ResponseEntity.ok(ApiResponse.success("Vehicle information updated successfully"));
    }

    /**
     * Update station owner information in the session
     *
     * @param stationOwnerInfo the station owner information
     * @return success response
     */
    @PutMapping("/station-owner-info")
    public ResponseEntity<ApiResponse<String>> updateStationOwnerInfo(@Valid @RequestBody StationOwnerInfoDTO stationOwnerInfo) {
        log.info("Updating station owner info in session for: {}", stationOwnerInfo.getFullName());

        sessionService.storeStationOwnerInfo(stationOwnerInfo);

        return ResponseEntity.ok(ApiResponse.success("Station owner information updated successfully"));
    }

    /**
     * Update business information in the session
     *
     * @param businessInfo the business information
     * @return success response
     */
    @PutMapping("/business-info")
    public ResponseEntity<ApiResponse<String>> updateBusinessInfo(@Valid @RequestBody BusinessInfoDTO businessInfo) {
        log.info("Updating business info in session for: {}", businessInfo.getBusinessName());

        sessionService.storeBusinessInfo(businessInfo);

        return ResponseEntity.ok(ApiResponse.success("Business information updated successfully"));
    }

    /**
     * Update email verification status in the session
     *
     * @param data the email verification status
     * @return success response
     */
    @PutMapping("/email-verified")
    public ResponseEntity<ApiResponse<String>> updateEmailVerified(@RequestBody Map<String, Boolean> data) {
        Boolean verified = data.get("verified");

        if (verified == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Missing 'verified' field"));
        }

        log.info("Updating email verification status in session: {}", verified);

        sessionService.setEmailVerified(verified);

        return ResponseEntity.ok(ApiResponse.success("Email verification status updated successfully"));
    }

    /**
     * Update current step in the session
     *
     * @param data the current step
     * @return success response
     */
    @PutMapping("/current-step")
    public ResponseEntity<ApiResponse<String>> updateCurrentStep(@RequestBody Map<String, Integer> data) {
        Integer currentStep = data.get("currentStep");

        if (currentStep == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Missing 'currentStep' field"));
        }

        log.info("Updating current step in session: {}", currentStep);

        sessionService.setCurrentStep(currentStep);

        return ResponseEntity.ok(ApiResponse.success("Current step updated successfully"));
    }
}
