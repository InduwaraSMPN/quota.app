package com.quotaapp.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
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

            log.info("Attempting to send verification email to: {} using sender: {}", to, fromEmail);
            mailSender.send(message);
            log.info("Verification email sent successfully to: {}", to);
        } catch (MailAuthenticationException e) {
            log.error("Authentication failed when sending email to: {}. Check your email credentials.", to, e);
            throw new RuntimeException("Email authentication failed. Please check your email configuration.", e);
        } catch (MailSendException e) {
            log.error("Failed to send email to: {}. Mail server connection issue.", to, e);
            throw new RuntimeException("Failed to connect to mail server. Please try again later.", e);
        } catch (Exception e) {
            log.error("Unexpected error when sending verification email to: {}", to, e);
            throw new RuntimeException("Failed to send verification email due to an unexpected error", e);
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

            log.info("Attempting to send welcome email to: {}", to);
            mailSender.send(message);
            log.info("Welcome email sent successfully to: {}", to);
        } catch (MailException e) {
            log.error("Failed to send welcome email to: {}", to, e);
            // Don't throw an exception here, as this is not critical
        } catch (Exception e) {
            log.error("Unexpected error when sending welcome email to: {}", to, e);
            // Don't throw an exception here, as this is not critical
        }
    }

    /**
     * Send a registration confirmation email to the station owner
     *
     * @param to the recipient's email address
     * @param fullName the station owner's full name
     */
    public void sendRegistrationConfirmationEmail(String to, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Quota App - Registration Confirmation");
            message.setText("Dear " + fullName + ",\n\n" +
                    "Thank you for registering your fuel station with Quota App!\n\n" +
                    "Your registration has been received and is pending verification by our administrators. " +
                    "You will receive another email once your account has been verified.\n\n" +
                    "Thank you for choosing Quota App!\n\n" +
                    "Best regards,\n" +
                    "The Quota App Team");

            log.info("Attempting to send registration confirmation email to: {}", to);
            mailSender.send(message);
            log.info("Registration confirmation email sent successfully to: {}", to);
        } catch (MailException e) {
            log.error("Failed to send registration confirmation email to: {}", to, e);
            // Don't throw an exception here, as this is not critical
        } catch (Exception e) {
            log.error("Unexpected error when sending registration confirmation email to: {}", to, e);
            // Don't throw an exception here, as this is not critical
        }
    }
}
