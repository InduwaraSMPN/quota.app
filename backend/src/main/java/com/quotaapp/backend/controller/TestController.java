package com.quotaapp.backend.controller;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quotaapp.backend.dto.signup.AdminInfoDTO;
import com.quotaapp.backend.dto.signup.LoginInfoDTO;
import com.quotaapp.backend.service.EmailService;
import com.quotaapp.backend.service.SessionService;
import com.quotaapp.backend.service.SmsService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/test")
@Slf4j
public class TestController {

    @Autowired
    private SessionService sessionService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;

    @GetMapping("/public")
    public ResponseEntity<Map<String, String>> publicEndpoint() {
        log.info("Public endpoint called");
        Map<String, String> response = new HashMap<>();
        response.put("message", "This is a public endpoint");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        log.info("Ping endpoint called");
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/test-email")
    public ResponseEntity<Map<String, Object>> testEmail(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        log.info("Test email endpoint called for: {}", email);

        if (email == null || email.isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Email is required");
            return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body(errorResponse);
        }

        try {
            // Generate a test verification code
            String testCode = String.format("%06d", new java.util.Random().nextInt(1000000));

            // Send the test email using the autowired EmailService
            log.info("Sending test email to: {} with code: {}", email, testCode);
            emailService.sendVerificationCode(email, testCode);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test email sent successfully");
            response.put("email", email);
            response.put("testCode", testCode);

            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(response);
        } catch (Exception e) {
            log.error("Error sending test email to: {}", email, e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to send test email");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("exceptionType", e.getClass().getName());

            return ResponseEntity.internalServerError()
                .contentType(MediaType.APPLICATION_JSON)
                .body(errorResponse);
        }
    }

    @PostMapping("/test-sms")
    public ResponseEntity<Map<String, Object>> testSms(@RequestBody Map<String, String> data) {
        String phoneNumber = data.get("phoneNumber");
        log.info("Test SMS endpoint called for: {}", phoneNumber);

        if (phoneNumber == null || phoneNumber.isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Phone number is required");
            return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body(errorResponse);
        }

        try {
            // Check if SMS service is configured
            if (!smsService.isSmsConfigured()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "SMS service is not properly configured");
                errorResponse.put("message", "Please check Twilio environment variables");
                return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorResponse);
            }

            // Create a test user for SMS sending (we need a user object for the SMS service)
            // In a real scenario, this would be the authenticated user
            com.quotaapp.backend.model.User testUser = new com.quotaapp.backend.model.User();
            testUser.setEmail("test@quota.app");
            testUser.setId(1L); // Temporary ID for testing

            // Generate a test verification code
            String testCode = String.format("%06d", new java.util.Random().nextInt(1000000));
            String testMessage = String.format("quota.app: Test SMS - Your verification code is %s. This is a test message.", testCode);

            // Send the test SMS
            log.info("Sending test SMS to: {} with message: {}", phoneNumber, testMessage);
            var smsNotification = smsService.sendSms(testUser, phoneNumber, testMessage);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test SMS sent successfully");
            response.put("phoneNumber", phoneNumber);
            response.put("testCode", testCode);
            response.put("smsStatus", smsNotification.getStatus());
            response.put("twilioSid", smsNotification.getTwilioSid());

            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(response);
        } catch (Exception e) {
            log.error("Error sending test SMS to: {}", phoneNumber, e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to send test SMS");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("exceptionType", e.getClass().getName());

            return ResponseEntity.internalServerError()
                .contentType(MediaType.APPLICATION_JSON)
                .body(errorResponse);
        }
    }

    @GetMapping("/sms-config")
    public ResponseEntity<Map<String, Object>> checkSmsConfig() {
        log.info("SMS configuration check endpoint called");

        Map<String, Object> response = new HashMap<>();

        try {
            boolean isConfigured = smsService.isSmsConfigured();
            response.put("configured", isConfigured);
            response.put("message", isConfigured ? "SMS service is properly configured" : "SMS service is not configured");

            // Add configuration details (without sensitive data)
            Map<String, Object> configDetails = new HashMap<>();
            configDetails.put("twilioEnabled", System.getenv("TWILIO_ENABLED") != null ? System.getenv("TWILIO_ENABLED") : "not set");
            configDetails.put("accountSidSet", System.getenv("TWILIO_ACCOUNT_SID") != null && !System.getenv("TWILIO_ACCOUNT_SID").isEmpty());
            configDetails.put("authTokenSet", System.getenv("TWILIO_AUTH_TOKEN") != null && !System.getenv("TWILIO_AUTH_TOKEN").isEmpty());
            configDetails.put("phoneNumberSet", System.getenv("TWILIO_PHONE_NUMBER") != null && !System.getenv("TWILIO_PHONE_NUMBER").isEmpty());

            response.put("configDetails", configDetails);

            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(response);
        } catch (Exception e) {
            log.error("Error checking SMS configuration", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to check SMS configuration");
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.internalServerError()
                .contentType(MediaType.APPLICATION_JSON)
                .body(errorResponse);
        }
    }

    @GetMapping("/protected")
    public ResponseEntity<Map<String, String>> protectedEndpoint() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Map<String, String> response = new HashMap<>();
        response.put("message", "This is a protected endpoint");
        response.put("user", authentication.getName());
        response.put("authorities", authentication.getAuthorities().toString());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/session")
    public ResponseEntity<Map<String, Object>> sessionTest(HttpServletRequest request, HttpServletResponse response) {
        try {
            log.info("Session test endpoint called");
            Map<String, Object> responseData = new HashMap<>();

            // Log request details for debugging
            log.info("Request URI: {}", request.getRequestURI());
            log.info("Request Method: {}", request.getMethod());
            log.info("Request Origin: {}", request.getHeader("Origin"));
            log.info("Request Headers: {}", Collections.list(request.getHeaderNames())
                .stream()
                .map(name -> name + "=" + request.getHeader(name))
                .collect(Collectors.joining(", ")));

            // Get the session (create if it doesn't exist)
            HttpSession session = request.getSession(true);

            // Basic session info
            responseData.put("sessionId", session.getId());
            responseData.put("isNew", session.isNew());
            responseData.put("creationTime", session.getCreationTime());
            responseData.put("lastAccessedTime", session.getLastAccessedTime());
            responseData.put("maxInactiveInterval", session.getMaxInactiveInterval());

            // Add all session attributes for debugging
            Map<String, Object> sessionAttributes = new HashMap<>();
            Collections.list(session.getAttributeNames()).forEach(name -> {
                sessionAttributes.put(name, session.getAttribute(name));
            });
            responseData.put("sessionAttributes", sessionAttributes);

            // Get registration data from session
            try {
                LoginInfoDTO loginInfo = sessionService.getLoginInfo();
                responseData.put("loginInfo", loginInfo);
                log.info("Session test - Login info: {}", loginInfo);
            } catch (Exception e) {
                log.error("Error getting login info from session", e);
                responseData.put("loginInfoError", e.getMessage());
            }

            try {
                AdminInfoDTO adminInfo = sessionService.getAdminInfo();
                responseData.put("adminInfo", adminInfo);
                log.info("Session test - Admin info: {}", adminInfo);
            } catch (Exception e) {
                log.error("Error getting admin info from session", e);
                responseData.put("adminInfoError", e.getMessage());
            }

            try {
                boolean emailVerified = sessionService.isEmailVerified();
                responseData.put("emailVerified", emailVerified);
            } catch (Exception e) {
                log.error("Error getting email verified from session", e);
                responseData.put("emailVerifiedError", e.getMessage());
            }

            try {
                Integer currentStep = sessionService.getCurrentStep();
                responseData.put("currentStep", currentStep);
            } catch (Exception e) {
                log.error("Error getting current step from session", e);
                responseData.put("currentStepError", e.getMessage());
            }

            // Add a test attribute to the session
            session.setAttribute("testAttribute", "This is a test attribute set at " + System.currentTimeMillis());
            responseData.put("testAttribute", session.getAttribute("testAttribute"));

            // Log response details
            log.info("Session test - Response data: {}", responseData);

            // Ensure CORS headers are set
            String origin = request.getHeader("Origin");
            if (origin != null) {
                response.setHeader("Access-Control-Allow-Origin", origin);
                response.setHeader("Access-Control-Allow-Credentials", "true");
            }

            return ResponseEntity.ok(responseData);
        } catch (Exception e) {
            log.error("Error in session test endpoint", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error processing session: " + e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/session/store")
    public ResponseEntity<Map<String, String>> storeInSession(@RequestBody Map<String, Object> data) {
        try {
            if (data.containsKey("loginInfo")) {
                LoginInfoDTO loginInfo = new LoginInfoDTO();
                loginInfo.setEmail((String) data.get("loginInfo"));
                sessionService.storeLoginInfo(loginInfo);
                log.info("Stored login info in session: {}", loginInfo);
            }

            if (data.containsKey("adminInfo")) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, String> adminInfoMap = (Map<String, String>) data.get("adminInfo");

                    // Validate required fields
                    if (adminInfoMap == null) {
                        log.error("adminInfo is null");
                        throw new IllegalArgumentException("adminInfo is null");
                    }

                    // Log the received data
                    log.info("Received adminInfo data: {}", adminInfoMap);

                    AdminInfoDTO adminInfo = AdminInfoDTO.builder()
                        .fullName(adminInfoMap.get("fullName"))
                        .employeeId(adminInfoMap.get("employeeId"))
                        .department(adminInfoMap.get("department"))
                        .contactNumber(adminInfoMap.get("contactNumber"))
                        .emergencyContactNumber(adminInfoMap.get("emergencyContactNumber"))
                        .address(adminInfoMap.get("address"))
                        .build();

                    sessionService.storeAdminInfo(adminInfo);
                    log.info("Stored admin info in session: {}", adminInfo);
                } catch (Exception e) {
                    log.error("Error processing adminInfo", e);
                }
            }

            if (data.containsKey("emailVerified")) {
                boolean emailVerified = (boolean) data.get("emailVerified");
                sessionService.setEmailVerified(emailVerified);
                log.info("Set email verified in session: {}", emailVerified);
            }

            if (data.containsKey("currentStep")) {
                int currentStep = ((Number) data.get("currentStep")).intValue();
                sessionService.setCurrentStep(currentStep);
                log.info("Set current step in session: {}", currentStep);
            }

            Map<String, String> response = new HashMap<>();
            response.put("message", "Data stored in session successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error storing data in session", e);
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error storing data in session: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}