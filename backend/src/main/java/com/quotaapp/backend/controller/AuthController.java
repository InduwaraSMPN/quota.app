package com.quotaapp.backend.controller;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.dto.AuthRequest;
import com.quotaapp.backend.dto.AuthResponse;
import com.quotaapp.backend.dto.signup.EmailVerificationDTO;
import com.quotaapp.backend.exception.InvalidVerificationCodeException;
import com.quotaapp.backend.service.AuthService;
import com.quotaapp.backend.service.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Auth controller is working");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        try {
            log.info("Login attempt: {}", request.getUsername());

            AuthResponse authResponse = authService.authenticate(request);

            log.info("Login successful for: {} with role: {}", authResponse.getUsername(), authResponse.getRole());

            return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
        } catch (Exception e) {
            log.error("Login error for {}: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid username or password"));
        }
    }

    /**
     * Send verification code to email
     *
     * @param data the email data
     * @return the response
     */
    @PostMapping("/send-verification-code")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendVerificationCode(@Valid @RequestBody Map<String, String> data) {
        String email = data.get("email");
        log.info("Sending verification code to: {}", email);

        try {
            boolean sent = emailVerificationService.sendVerificationCode(email);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("sent", sent);

            if (sent) {
                return ResponseEntity.ok(ApiResponse.success("Verification code sent successfully", responseData));
            } else {
                return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to send verification code"));
            }
        } catch (IllegalStateException e) {
            // This is for already registered emails
            log.warn("Attempted to send verification code to already registered email: {}", email);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error sending verification code to: {}", email, e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("An unexpected error occurred. Please try again later."));
        }
    }

    /**
     * Verify email code
     *
     * @param data the verification data
     * @return the response
     */
    @PostMapping("/verify-email-code")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyEmailCode(@Valid @RequestBody Map<String, String> data) {
        String email = data.get("email");
        String code = data.get("code");
        log.info("Verifying email code for: {}", email);

        try {
            boolean verified = emailVerificationService.verifyCode(email, code);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("verified", verified);

            if (verified) {
                return ResponseEntity.ok(ApiResponse.success("Email verified successfully", responseData));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("Invalid verification code"));
            }
        } catch (InvalidVerificationCodeException e) {
            log.warn("Verification code error for {}: {}", email, e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error verifying email code for: {}", email, e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("An unexpected error occurred. Please try again later."));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestParam String refreshToken) {
        return authService.refreshToken(refreshToken)
                .map(authResponse -> ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", authResponse)))
                .orElse(ResponseEntity.status(401).body(ApiResponse.error("Invalid or expired refresh token")));
    }
}