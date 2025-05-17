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
import com.quotaapp.backend.dto.signup.AdminInfoDTO;
import com.quotaapp.backend.dto.signup.BusinessInfoDTO;
import com.quotaapp.backend.dto.signup.EmailVerificationDTO;
import com.quotaapp.backend.dto.signup.LoginInfoDTO;
import com.quotaapp.backend.dto.signup.OwnerInfoDTO;
import com.quotaapp.backend.dto.signup.PasswordSetupDTO;
import com.quotaapp.backend.dto.signup.RegistrationSessionDTO;
import com.quotaapp.backend.dto.signup.StationOwnerInfoDTO;
import com.quotaapp.backend.dto.signup.VehicleInfoDTO;
import com.quotaapp.backend.service.SessionService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
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
    public ResponseEntity<ApiResponse<RegistrationSessionDTO>> getRegistrationData(HttpServletRequest request, HttpServletResponse response) {
        try {
            log.info("Retrieving registration data from session");

            // Log request details for debugging
            log.info("Request URI: {}", request.getRequestURI());
            log.info("Request Method: {}", request.getMethod());
            log.info("Request Origin: {}", request.getHeader("Origin"));

            // Get the session
            HttpSession session = request.getSession(false);

            if (session == null) {
                log.warn("No session found when retrieving registration data");
                return ResponseEntity.ok(ApiResponse.success("No session found", new RegistrationSessionDTO()));
            }

            log.info("Session ID: {}", session.getId());

            // Build the session data
            RegistrationSessionDTO sessionData = RegistrationSessionDTO.builder()
                    .loginInfo(sessionService.getLoginInfo())
                    .passwordSetup(sessionService.getPassword())
                    .ownerInfo(sessionService.getOwnerInfo())
                    .vehicleInfo(sessionService.getVehicleInfo())
                    .stationOwnerInfo(sessionService.getStationOwnerInfo())
                    .businessInfo(sessionService.getBusinessInfo())
                    .adminInfo(sessionService.getAdminInfo())
                    .emailVerified(sessionService.isEmailVerified())
                    .currentStep(sessionService.getCurrentStep())
                    .build();

            // Ensure CORS headers are set
            String origin = request.getHeader("Origin");
            if (origin != null) {
                response.setHeader("Access-Control-Allow-Origin", origin);
                response.setHeader("Access-Control-Allow-Credentials", "true");
            }

            log.info("Registration data retrieved successfully: {}", sessionData);
            return ResponseEntity.ok(ApiResponse.success("Registration data retrieved", sessionData));
        } catch (Exception e) {
            log.error("Error retrieving registration data from session", e);
            return ResponseEntity.status(500).body(ApiResponse.error("Error retrieving registration data: " + e.getMessage()));
        }
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

        if (sessionData.getAdminInfo() != null) {
            sessionService.storeAdminInfo(sessionData.getAdminInfo());
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
     * Update admin information in the session
     *
     * @param adminInfo the admin information
     * @return success response
     */
    @PutMapping("/admin-info")
    public ResponseEntity<ApiResponse<String>> updateAdminInfo(@Valid @RequestBody AdminInfoDTO adminInfo) {
        log.info("Updating admin info in session for: {}", adminInfo.getFullName());

        sessionService.storeAdminInfo(adminInfo);

        return ResponseEntity.ok(ApiResponse.success("Admin information updated successfully"));
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

    /**
     * Simple test endpoint to check if the session controller is accessible
     *
     * @return success response with timestamp
     */
    @GetMapping("/ping")
    public ResponseEntity<ApiResponse<Map<String, Object>>> ping(HttpServletRequest request, HttpServletResponse response) {
        log.info("Session controller ping endpoint called");

        // Log request details for debugging
        log.info("Request URI: {}", request.getRequestURI());
        log.info("Request Method: {}", request.getMethod());
        log.info("Request Origin: {}", request.getHeader("Origin"));

        // Get the session
        HttpSession session = request.getSession(true);
        log.info("Session ID: {}", session.getId());

        // Create response data
        Map<String, Object> data = new HashMap<>();
        data.put("timestamp", System.currentTimeMillis());
        data.put("sessionId", session.getId());
        data.put("isNewSession", session.isNew());

        // Ensure CORS headers are set
        String origin = request.getHeader("Origin");
        if (origin != null) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Credentials", "true");
        }

        return ResponseEntity.ok(ApiResponse.success("Session controller is accessible", data));
    }
}
