package com.quotaapp.backend.controller;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.dto.AuthRequest;
import com.quotaapp.backend.dto.AuthResponse;
import com.quotaapp.backend.service.AuthService;
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

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestParam String refreshToken) {
        return authService.refreshToken(refreshToken)
                .map(authResponse -> ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", authResponse)))
                .orElse(ResponseEntity.status(401).body(ApiResponse.error("Invalid or expired refresh token")));
    }
}