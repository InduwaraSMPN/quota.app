package com.quotaapp.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Send a verification code to the user's email
     * 
     * @param to the recipient's email address
     * @param verificationCode the verification code to send
     */
    public void sendVerificationCode(String to, String verificationCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Quota App - Email Verification Code");
            message.setText("Your verification code is: " + verificationCode + "\n\n" +
                    "This code will expire in 10 minutes.\n\n" +
                    "If you did not request this code, please ignore this email.");
            
            mailSender.send(message);
            log.info("Verification email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", to, e);
            throw new RuntimeException("Failed to send verification email", e);
        }
    }
    
    /**
     * Send a welcome email to the user
     * 
     * @param to the recipient's email address
     * @param fullName the user's full name
     */
    public void sendWelcomeEmail(String to, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Welcome to Quota App");
            message.setText("Dear " + fullName + ",\n\n" +
                    "Welcome to Quota App! Your account has been successfully created.\n\n" +
                    "You can now log in to the application and start managing your fuel quota.\n\n" +
                    "Thank you for choosing Quota App!\n\n" +
                    "Best regards,\n" +
                    "The Quota App Team");
            
            mailSender.send(message);
            log.info("Welcome email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", to, e);
            // Don't throw an exception here, as this is not critical
        }
    }
}
