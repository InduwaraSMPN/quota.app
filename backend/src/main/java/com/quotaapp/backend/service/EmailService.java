package com.quotaapp.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // Shared CSS styles for all emails to ensure consistency and maintainability
    private static final String SHARED_EMAIL_STYLES = """
        <style>
            body {
                font-family: 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                margin: 0;
                padding: 0;
                background-color: #e9e9e9; /* Neutral background for the email client view area */
            }
            .email-body-wrapper {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff; /* Main container background */
                border-radius: 8px;
                overflow: hidden; /* Ensures content respects border-radius */
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            }
            .header {
                padding: 30px 40px 20px;
                text-align: center;
                border-bottom: 1px solid #eeeeee;
            }
            .logo {
                max-width: 170px;
                height: auto;
                margin-bottom: 10px;
            }
            .content-area {
                padding: 30px 40px;
                background-color: #f9f9f9; /* Content area background */
            }
            .content-area h1 {
                font-size: 22px;
                font-weight: 600;
                color: #333333;
                margin-top: 0;
                margin-bottom: 25px; /* Increased bottom margin for heading */
            }
            .content-area p {
                font-size: 15px;
                line-height: 1.7;
                margin-top: 0;
                margin-bottom: 18px;
            }
            .footer {
                padding: 25px 40px; /* Increased padding */
                border-top: 1px solid #eeeeee;
                font-size: 12px;
                color: #999999;
                text-align: center;
                background-color: #f0f0f0; /* Slightly different footer background for separation */
            }
            .footer p {
                margin: 5px 0;
                font-size: 12px; /* Ensure footer p tags also use this size */
            }
            .footer a {
                color: #9e1d20; /* Consistent link color */
                text-decoration: none;
            }
            .footer a:hover {
                text-decoration: underline;
            }

            /* Verification Email Specific */
            .verification-code-block {
                font-size: 28px;
                font-weight: bold;
                letter-spacing: 3px;
                text-align: center;
                padding: 18px;
                margin: 30px 0; /* Increased vertical margin */
                background-color: #e0e0e0;
                border-radius: 6px;
                color: #9e1d20; /* Original color */
                border: 1px dashed #c0c0c0; /* Subtle dashed border */
                transition: transform 0.2s ease-in-out;
            }
            .verification-code-block:hover {
                transform: scale(1.02); /* Subtle zoom on hover */
            }
            .expiry-notice {
                font-size: 14px;
                color: #777777;
                margin-top: 25px;
                text-align: center;
            }
             .expiry-notice p {
                font-size: 14px; /* Ensure p inside expiry-notice also uses this size */
                margin-bottom: 8px;
            }

            /* Welcome Email Specific */
            .button-container {
                text-align: center;
                margin: 30px 0; /* Increased vertical margin */
            }
            .button {
                display: inline-block;
                min-width: 200px; /* Increased min-width for better clickability */
                padding: 14px 28px;
                background-color: #9e1d20; /* Original color */
                color: #ffffff !important; /* Important to override link styles if 'a' tag is used */
                text-align: center;
                text-decoration: none !important;
                font-weight: bold;
                border-radius: 5px;
                transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out;
            }
            .button:hover {
                background-color: #8c1a1c; /* Darker shade of #9e1d20 */
                transform: translateY(-2px); /* Slight lift on hover */
                text-decoration: none !important;
            }

            /* Registration Confirmation Email Specific */
            .status-box {
                background-color: #fff8e1; /* Original color */
                border-left: 5px solid #ffc107; /* Original color, slightly thicker for emphasis */
                padding: 20px;
                margin: 30px 0; /* Increased vertical margin */
                border-radius: 0 6px 6px 0; /* Radius on the right side */
            }
            .status-box h3 {
                font-size: 18px;
                font-weight: bold;
                color: #ff8f00; /* Original color */
                margin-top: 0;
                margin-bottom: 10px;
            }
            .status-box p {
                font-size: 15px; /* Match general paragraph font size */
                margin-bottom: 0; /* No margin for last p in box */
            }
             .status-box p:not(:last-child) { /* Add margin to paragraphs except the last one */
                margin-bottom: 10px;
            }


            /* Responsive Styles */
            @media screen and (max-width: 600px) {
                .email-body-wrapper {
                    width: 100% !important;
                    margin: 0 auto !important;
                    border-radius: 0 !important;
                    box-shadow: none !important;
                }
                .header, .content-area, .footer {
                    padding: 20px !important;
                }
                .content-area h1 {
                    font-size: 20px !important;
                    margin-bottom: 20px !important;
                }
                .content-area p {
                    font-size: 14px !important;
                    margin-bottom: 15px !important;
                }
                .logo {
                    max-width: 150px !important;
                }
                .verification-code-block {
                    font-size: 24px !important;
                    padding: 15px !important;
                    letter-spacing: 2px !important;
                    margin: 25px 0 !important;
                }
                .button {
                    padding: 12px 24px !important;
                    min-width: 180px !important;
                }
                .button-container {
                    margin: 25px 0 !important;
                }
                .status-box {
                    padding: 15px !important;
                    margin: 25px 0 !important;
                }
                .status-box h3 {
                    font-size: 17px !important;
                }
            }
        </style>
    """;

    /**
     * Send a verification code to the user's email
     *
     * @param to the recipient's email address
     * @param verificationCode the verification code to send
     */
    public void sendVerificationCode(String to, String verificationCode) {
        try {
            log.info("Creating verification email for: {} with code: {}", to, verificationCode);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("quota.app - Email Verification Code");

            String emailBody = """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    %s <!-- Shared CSS Styles -->
                </head>
                <body>
                    <div class="email-body-wrapper">
                        <div class="header">
                            <img src="https://ik.imagekit.io/pasindunaduninduwara/quota.app.logo.svg?updatedAt=1747030380891" alt="quota.app" class="logo">
                        </div>
                        <div class="content-area">
                            <h1>Verify Your Email Address</h1>
                            <p>Hello,</p>
                            <p>We received a request to verify your email address for quota.app. Please use the verification code below to complete your registration:</p>
                            <div class="verification-code-block">%s</div>
                            <div class="expiry-notice">
                                <p>This code will expire in <strong>10 minutes</strong>.</p>
                                <p>If you didn't request this code, you can safely ignore this email.</p>
                            </div>
                        </div>
                        <div class="footer">
                            <p>© %s  quota.app All rights reserved.</p>
                            <p>This is an automated message, please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(SHARED_EMAIL_STYLES, verificationCode, java.time.Year.now().getValue());

            helper.setText(emailBody, true); // Set to true for HTML content

            log.info("Verification email content: From: {}, To: {}, Subject: {}", fromEmail, to, helper.getMimeMessage().getSubject());
            log.info("Attempting to send verification email to: {} using sender: {}", to, fromEmail);

            mailSender.send(mimeMessage);

            log.info("Verification email sent successfully to: {}", to);
        } catch (MailAuthenticationException e) {
            log.error("Authentication failed when sending email to: {}. Check your email credentials.", to, e);
            log.error("Mail authentication details: username={}, password={} (length)", fromEmail,
                    (System.getProperty("spring.mail.password") != null ? System.getProperty("spring.mail.password").length() : "null"));
            throw new RuntimeException("Email authentication failed. Please check your email configuration.", e);
        } catch (MailSendException e) {
            log.error("Failed to send email to: {}. Mail server connection issue.", to, e);
            log.error("Mail server details: host={}, port={}", System.getProperty("spring.mail.host"), System.getProperty("spring.mail.port"));
            throw new RuntimeException("Failed to connect to mail server. Please try again later.", e);
        } catch (MessagingException e) {
            log.error("Failed to create MIME message for: {}", to, e);
            throw new RuntimeException("Failed to create email message", e);
        } catch (Exception e) {
            log.error("Unexpected error when sending verification email to: {}", to, e);
            log.error("Exception class: {}, Message: {}", e.getClass().getName(), e.getMessage());
            throw new RuntimeException("Failed to send verification email due to an unexpected error", e);
        }
    }

    /**
     * Send a welcome email to the user
     *
     * @param to the recipient's email address
     * @param fullName the user's full name
     * @param role the user's role (optional)
     */
    public void sendWelcomeEmail(String to, String fullName, String... role) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Welcome to quota.app"); // Consistent naming with space

            String roleSpecificText;
            String roleSpecificButtonText;
            // Define a base URL for the application. This could be externalized to application properties.
            String appBaseUrl = "https://quota.app"; // Example base URL, consider making this configurable
            String buttonUrl = appBaseUrl + "/login"; // Default login URL

            if (role.length > 0 && "Admin".equalsIgnoreCase(role[0])) {
                roleSpecificText = "You have been registered as an Administrator. You can now log in to the application and access the admin portal using the button below.";
                roleSpecificButtonText = "Access Admin Portal";
                // Example: buttonUrl = appBaseUrl + "/admin"; // Specific URL for admin
            } else {
                roleSpecificText = "You can now log in to the application and start managing your fuel quota. Click the button below to get started!";
                roleSpecificButtonText = "Manage Your Quota";
            }

            String emailBody = """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    %s <!-- Shared CSS Styles -->
                </head>
                <body>
                    <div class="email-body-wrapper">
                        <div class="header">
                            <img src="https://ik.imagekit.io/pasindunaduninduwara/quota.app.logo.svg?updatedAt=1747030380891" alt="quota.app" class="logo">
                        </div>
                        <div class="content-area">
                            <h1>Welcome to quota.app!</h1>
                            <p>Dear %s,</p>
                            <p>Thank you for joining quota.app! Your account has been successfully created.</p>
                            <p>%s</p>
                            <div class="button-container">
                                <a href="%s" class="button">%s</a>
                            </div>
                            <p>If you have any questions or need assistance, please don't hesitate to contact our support team (e.g., at support@quota.app).</p>
                        </div>
                        <div class="footer">
                            <p>Thank you for choosing quota.app!</p>
                            <p>© %s quota.app. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(SHARED_EMAIL_STYLES, fullName, roleSpecificText, buttonUrl, roleSpecificButtonText, java.time.Year.now().getValue());

            helper.setText(emailBody, true);

            log.info("Attempting to send welcome email to: {}", to);
            mailSender.send(mimeMessage);
            log.info("Welcome email sent successfully to: {}", to);
        } catch (MailException e) {
            log.error("Failed to send welcome email to: {}", to, e);
            // Don't throw an exception here, as this is not critical for sign-up flow
        } catch (Exception e) {
            log.error("Unexpected error when sending welcome email to: {}", to, e);
            // Don't throw an exception here
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
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("quota.app - Registration Confirmation");

            String emailBody = """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    %s <!-- Shared CSS Styles -->
                </head>
                <body>
                    <div class="email-body-wrapper">
                        <div class="header">
                            <img src="https://ik.imagekit.io/pasindunaduninduwara/quota.app.logo.svg?updatedAt=1747030380891" alt="quota.app" class="logo">
                        </div>
                        <div class="content-area">
                            <h1>Registration Under Review</h1>
                            <p>Dear %s,</p>
                            <p>Thank you for registering your fuel station with quota.app! We have received your application.</p>
                            <div class="status-box">
                                <h3>Registration Status: Pending Review</h3>
                                <p>Your registration is currently being reviewed by our administrative team. This process typically takes 1-2 business days.</p>
                                <p>You will receive another email once your account has been verified and approved. No further action is needed from your side at this moment.</p>
                            </div>
                            <p>If you have any urgent questions about your registration, please feel free to contact our support team (e.g., at support@quota.app).</p>
                        </div>
                        <div class="footer">
                            <p>Thank you for your patience and for choosing quota.app!</p>
                            <p>© %s  quota.app All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(SHARED_EMAIL_STYLES, fullName, java.time.Year.now().getValue());

            helper.setText(emailBody, true);

            log.info("Attempting to send registration confirmation email to: {}", to);
            mailSender.send(mimeMessage);
            log.info("Registration confirmation email sent successfully to: {}", to);
        } catch (MailException e) {
            log.error("Failed to send registration confirmation email to: {}", to, e);
            // Don't throw an exception here
        } catch (Exception e) {
            log.error("Unexpected error when sending registration confirmation email to: {}", to, e);
            // Don't throw an exception here
        }
    }
}