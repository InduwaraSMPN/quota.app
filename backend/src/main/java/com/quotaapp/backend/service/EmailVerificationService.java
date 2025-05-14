package com.quotaapp.backend.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.quotaapp.backend.exception.InvalidVerificationCodeException;
import com.quotaapp.backend.model.EmailVerificationToken;
import com.quotaapp.backend.model.Role;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.repository.primary.EmailVerificationTokenRepository;
import com.quotaapp.backend.repository.primary.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    private static final int VERIFICATION_CODE_LENGTH = 6;
    private static final int VERIFICATION_CODE_EXPIRY_MINUTES = 10;

    /**
     * Generate and send a verification code to the user's email
     *
     * @param email the user's email
     * @return true if the code was sent successfully, false otherwise
system allows already-registered users to receive verification codes     * @throws IllegalStateException if the email is already registered with a completed registration
     */
    @Transactional
    public boolean sendVerificationCode(String email) {
        try {
            // Check if the email is already registered with a completed registration
            if (userRepository.existsByEmailAndHasVehicleOwner(email)) {
                log.warn("Attempted to send verification code to already registered email: {}", email);
                throw new IllegalStateException("Email is already registered. Please use the login page instead.");
            }

            // Find or create a temporary user
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> createTemporaryUser(email));

            // Generate a verification code
            String verificationCode = generateVerificationCode();

            // Create a token
            EmailVerificationToken token = EmailVerificationToken.builder()
                    .user(user)
                    .token(verificationCode)
                    .expiresAt(LocalDateTime.now().plusMinutes(VERIFICATION_CODE_EXPIRY_MINUTES))
                    .build();

            // Save the token
            tokenRepository.save(token);

            // Send the verification code
            emailService.sendVerificationCode(email, verificationCode);

            log.info("Verification code sent to: {}", email);
            return true;
        } catch (IllegalStateException e) {
            // Rethrow the exception to be handled by the controller
            throw e;
        } catch (Exception e) {
            log.error("Failed to send verification code to: {}", email, e);
            return false;
        }
    }

    /**
     * Verify a verification code
     *
     * @param email the user's email
     * @param code the verification code
     * @return true if the code is valid, false otherwise
     */
    @Transactional
    public boolean verifyCode(String email, String code) {
        // Find the user
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            log.warn("User not found for email: {}", email);
            return false;
        }

        User user = userOpt.get();

        // Find the most recent token for the user
        Optional<EmailVerificationToken> tokenOpt = tokenRepository.findFirstByUserOrderByCreatedAtDesc(user);
        if (tokenOpt.isEmpty()) {
            log.warn("No verification token found for user: {}", email);
            return false;
        }

        EmailVerificationToken token = tokenOpt.get();

        // Check if the token is expired
        if (token.isExpired()) {
            log.warn("Verification token expired for user: {}", email);
            throw new InvalidVerificationCodeException("Verification code has expired. Please request a new one.");
        }

        // Check if the token is already used
        if (token.isUsed()) {
            log.warn("Verification token already used for user: {}", email);

            // Check if the provided code matches the token
            // If it does, this is likely a duplicate request with the correct code
            if (token.getToken().equals(code)) {
                log.info("Duplicate verification attempt with correct code for user: {}", email);

                // If the user's email is already verified, return true
                if (user.isEmailVerified()) {
                    return true;
                }

                // Otherwise, update the user's email verification status
                user.setEmailVerified(true);
                userRepository.save(user);
                return true;
            }

            throw new InvalidVerificationCodeException("Verification code has already been used. Please request a new one.");
        }

        // Check if the code matches
        if (!token.getToken().equals(code)) {
            log.warn("Invalid verification code for user: {}", email);
            throw new InvalidVerificationCodeException("Invalid verification code. Please try again.");
        }

        // Mark the token as used
        token.setUsed(true);
        tokenRepository.save(token);

        // Update the user's email verification status
        user.setEmailVerified(true);
        userRepository.save(user);

        log.info("Verification code verified and user email marked as verified for: {}", email);
        return true;
    }

    /**
     * Create a temporary user for email verification
     *
     * @param email the user's email
     * @return the created user
     */
    private User createTemporaryUser(String email) {
        User user = User.builder()
                .email(email)
                .password("temporary") // Will be updated during registration
                .emailVerified(false)
                .role(Role.VEHICLE_OWNER) // Set a default role to avoid null constraint violation
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return userRepository.save(user);
    }

    /**
     * Generate a random verification code
     *
     * @return the generated code
     */
    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        StringBuilder code = new StringBuilder();

        for (int i = 0; i < VERIFICATION_CODE_LENGTH; i++) {
            code.append(random.nextInt(10));
        }

        return code.toString();
    }
}
