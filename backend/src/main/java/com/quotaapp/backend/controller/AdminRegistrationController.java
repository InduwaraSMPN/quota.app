package com.quotaapp.backend.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.dto.signup.AdminInfoDTO;
import com.quotaapp.backend.dto.signup.AdminRegistrationRequestDTO;
import com.quotaapp.backend.dto.signup.LoginInfoDTO;
import com.quotaapp.backend.dto.signup.PasswordSetupDTO;
import com.quotaapp.backend.model.AdminUser;
import com.quotaapp.backend.model.Department;
import com.quotaapp.backend.model.Role;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.repository.primary.AdminUserRepository;
import com.quotaapp.backend.repository.primary.DepartmentRepository;
import com.quotaapp.backend.repository.primary.UserRepository;
import com.quotaapp.backend.service.EmailService;
import com.quotaapp.backend.service.EmailVerificationService;
import com.quotaapp.backend.service.SessionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for admin user registration
 */
@RestController
@RequestMapping("/api/auth/register")
@RequiredArgsConstructor
@Slf4j
public class AdminRegistrationController {

    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final EmailVerificationService emailVerificationService;
    private final SessionService sessionService;

    /**
     * Step 1: Validate login information and send verification code
     *
     * @param loginInfoDTO the login information
     * @return success response or error response
     */
    @PostMapping("/admin/step1")
    public ResponseEntity<ApiResponse<String>> processStep1(@Valid @RequestBody LoginInfoDTO loginInfoDTO) {
        log.info("Processing admin registration step 1 for email: {}", loginInfoDTO.getEmail());

        try {
            // Validate the login information
            List<String> errors = validateLoginInfo(loginInfoDTO);

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
        } catch (IllegalStateException e) {
            // This is for already registered emails
            log.warn("Attempted to register already registered email: {}", loginInfoDTO.getEmail());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
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
     * Step 2: Validate password setup
     *
     * @param passwordSetupDTO the password setup information
     * @return success response or error response
     */
    @PostMapping("/admin/step2")
    public ResponseEntity<ApiResponse<String>> processStep2(@Valid @RequestBody PasswordSetupDTO passwordSetupDTO) {
        log.info("Processing admin registration step 2");

        try {
            // Get login info from session
            LoginInfoDTO loginInfoDTO = sessionService.getLoginInfo();
            if (loginInfoDTO == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Login information not found in session"));
            }

            // Validate the password setup
            List<String> errors = validatePasswordSetup(passwordSetupDTO);

            if (!errors.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Validation failed", errors));
            }

            // Store the password setup in the session
            sessionService.storePassword(passwordSetupDTO);

            return ResponseEntity.ok(ApiResponse.success("Password setup validated"));
        } catch (Exception e) {
            log.error("Error processing step 2", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("An error occurred during step 2: " + e.getMessage()));
        }
    }

    /**
     * Direct registration endpoint for admin users
     *
     * @param request the registration request
     * @return success response or error response
     */
    @PostMapping("/admin")
    public ResponseEntity<ApiResponse<Map<String, Object>>> registerAdmin(@Valid @RequestBody AdminRegistrationRequestDTO request) {
        log.info("Processing admin registration for: {}", request.getFullName());

        try {
            // Validate the registration request
            List<String> errors = new ArrayList<>();

            // Check if email is already registered
            if (userRepository.existsByEmail(request.getEmail())) {
                errors.add("Email is already registered");
            }

            // Check if employee ID is already registered
            if (adminUserRepository.existsByEmployeeId(request.getEmployeeId())) {
                errors.add("Employee ID is already registered");
            }

            // Check if department exists
            if (!departmentRepository.existsByName(request.getDepartment().toLowerCase())) {
                errors.add("Department does not exist: " + request.getDepartment());
            }

            if (!errors.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Validation failed", errors));
            }

            // Create the user
            User user = User.builder()
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(Role.ADMIN)
                    .emailVerified(true) // Auto-verify email for direct registration
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            User savedUser = userRepository.save(user);

            // Find the department
            Department department = departmentRepository.findByName(request.getDepartment().toLowerCase())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found: " + request.getDepartment()));

            // Create the admin user
            AdminUser adminUser = AdminUser.builder()
                    .user(savedUser)
                    .fullName(request.getFullName())
                    .employeeId(request.getEmployeeId())
                    .department(department)
                    .contactNumber(request.getContactNumber())
                    .emergencyContactNumber(request.getEmergencyContactNumber())
                    .address(request.getAddress())
                    .build();

            adminUserRepository.save(adminUser);

            // Send welcome email
            emailService.sendWelcomeEmail(savedUser.getEmail(), adminUser.getFullName(), "Admin");

            // Return success response with user ID
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("userId", savedUser.getId());
            responseData.put("email", savedUser.getEmail());
            responseData.put("role", savedUser.getRole());

            return ResponseEntity.ok(ApiResponse.success("Admin registration completed successfully", responseData));
        } catch (Exception e) {
            log.error("Error registering admin: {}", request.getFullName(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("An error occurred during registration: " + e.getMessage()));
        }
    }

    /**
     * Step 3: Validate admin information and complete registration
     *
     * @param adminInfoDTO the admin information
     * @return success response or error response
     */
    @PostMapping("/admin/step3")
    public ResponseEntity<ApiResponse<Map<String, Object>>> processStep3(@Valid @RequestBody AdminInfoDTO adminInfoDTO) {
        log.info("Processing admin registration step 3 for: {}", adminInfoDTO.getFullName());
        log.info("Received admin info: {}", adminInfoDTO);

        try {
            // Get login info and password from session
            LoginInfoDTO loginInfoDTO = sessionService.getLoginInfo();
            PasswordSetupDTO passwordSetupDTO = sessionService.getPassword();
            boolean emailVerified = sessionService.isEmailVerified();

            log.info("Session data - Login info: {}", loginInfoDTO);
            log.info("Session data - Password setup: {}", passwordSetupDTO != null ? "Present" : "Not present");
            log.info("Session data - Email verified: {}", emailVerified);

            if (loginInfoDTO == null || passwordSetupDTO == null) {
                log.warn("Previous steps data not found in session");
                return ResponseEntity.badRequest().body(ApiResponse.error("Previous steps data not found in session"));
            }

            // Validate the admin information
            List<String> errors = validateAdminInfo(adminInfoDTO);
            log.info("Validation errors: {}", errors);

            if (!errors.isEmpty()) {
                log.warn("Validation failed: {}", errors);
                return ResponseEntity.badRequest().body(ApiResponse.error("Validation failed", errors));
            }

            // Store the admin information in the session
            sessionService.storeAdminInfo(adminInfoDTO);
            log.info("Admin info stored in session");

            // Complete the registration
            log.info("Completing registration for email: {}", loginInfoDTO.getEmail());
            User user = completeRegistration(loginInfoDTO, passwordSetupDTO, adminInfoDTO, emailVerified);
            log.info("User created with ID: {}", user.getId());

            // Clear session data after successful registration
            sessionService.clearRegistrationData();
            log.info("Session data cleared");

            // Return success response with user ID
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("userId", user.getId());
            responseData.put("email", user.getEmail());
            responseData.put("role", user.getRole());

            log.info("Registration completed successfully for: {}", user.getEmail());
            return ResponseEntity.ok(ApiResponse.success("Admin registration completed successfully", responseData));
        } catch (Exception e) {
            log.error("Error processing step 3 for: {}", adminInfoDTO.getFullName(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("An error occurred during step 3: " + e.getMessage()));
        }
    }

    /**
     * Complete admin registration
     *
     * @param loginInfoDTO the login information
     * @param passwordSetupDTO the password setup information
     * @param adminInfoDTO the admin information
     * @param emailVerified whether the email is verified
     * @return the created user
     */
    private User completeRegistration(
            LoginInfoDTO loginInfoDTO,
            PasswordSetupDTO passwordSetupDTO,
            AdminInfoDTO adminInfoDTO,
            boolean emailVerified) {

        // Create or update the user
        User user = userRepository.findByEmail(loginInfoDTO.getEmail())
                .orElseGet(() -> User.builder()
                        .email(loginInfoDTO.getEmail())
                        .build());

        user.setPassword(passwordEncoder.encode(passwordSetupDTO.getPassword()));
        user.setRole(Role.ADMIN);
        user.setEmailVerified(emailVerified);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // Find the department
        Department department = departmentRepository.findByName(adminInfoDTO.getDepartment().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Department not found: " + adminInfoDTO.getDepartment()));

        // Create the admin user
        AdminUser adminUser = AdminUser.builder()
                .user(savedUser)
                .fullName(adminInfoDTO.getFullName())
                .employeeId(adminInfoDTO.getEmployeeId())
                .department(department)
                .contactNumber(adminInfoDTO.getContactNumber())
                .emergencyContactNumber(adminInfoDTO.getEmergencyContactNumber())
                .address(adminInfoDTO.getAddress())
                .build();

        adminUserRepository.save(adminUser);

        // Send welcome email
        emailService.sendWelcomeEmail(savedUser.getEmail(), adminUser.getFullName(), "Admin");

        return savedUser;
    }

    /**
     * Validate login information
     *
     * @param loginInfoDTO the login information
     * @return a list of validation errors, empty if validation is successful
     */
    private List<String> validateLoginInfo(LoginInfoDTO loginInfoDTO) {
        List<String> errors = new ArrayList<>();

        // Check if email is already registered
        if (userRepository.existsByEmail(loginInfoDTO.getEmail())) {
            errors.add("Email is already registered");
        }

        return errors;
    }

    /**
     * Validate password setup
     *
     * @param passwordSetupDTO the password setup information
     * @return a list of validation errors, empty if validation is successful
     */
    private List<String> validatePasswordSetup(PasswordSetupDTO passwordSetupDTO) {
        List<String> errors = new ArrayList<>();

        // Check if passwords match
        if (!passwordSetupDTO.getPassword().equals(passwordSetupDTO.getConfirmPassword())) {
            errors.add("Passwords do not match");
        }

        // Check password strength
        if (passwordSetupDTO.getPassword().length() < 8) {
            errors.add("Password must be at least 8 characters long");
        }

        return errors;
    }

    /**
     * Validate admin information
     *
     * @param adminInfoDTO the admin information
     * @return a list of validation errors, empty if validation is successful
     */
    private List<String> validateAdminInfo(AdminInfoDTO adminInfoDTO) {
        List<String> errors = new ArrayList<>();

        // Check if employee ID is already registered
        if (adminUserRepository.existsByEmployeeId(adminInfoDTO.getEmployeeId())) {
            errors.add("Employee ID is already registered");
        }

        // Check if department exists
        if (!departmentRepository.existsByName(adminInfoDTO.getDepartment().toLowerCase())) {
            errors.add("Department does not exist: " + adminInfoDTO.getDepartment());
        }

        return errors;
    }


}
