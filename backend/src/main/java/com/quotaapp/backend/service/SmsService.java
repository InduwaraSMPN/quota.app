package com.quotaapp.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.quotaapp.backend.model.SmsNotification;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.repository.primary.SmsNotificationRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for sending SMS notifications via Twilio
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final SmsNotificationRepository smsNotificationRepository;

    @Value("${twilio.account.sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth.token:}")
    private String twilioAuthToken;

    @Value("${twilio.phone.number:}")
    private String twilioPhoneNumber;

    @Value("${twilio.enabled:false}")
    private boolean twilioEnabled;

    /**
     * Initialize Twilio client
     */
    private void initializeTwilio() {
        if (twilioEnabled && twilioAccountSid != null && !twilioAccountSid.isEmpty() 
            && twilioAuthToken != null && !twilioAuthToken.isEmpty()) {
            Twilio.init(twilioAccountSid, twilioAuthToken);
        }
    }

    /**
     * Send SMS notification to a user
     *
     * @param user the user to send SMS to
     * @param phoneNumber the phone number to send to
     * @param message the message content
     * @return the created SMS notification record
     */
    @Transactional
    public SmsNotification sendSms(User user, String phoneNumber, String message) {
        log.info("Attempting to send SMS to {} for user {}", phoneNumber, user.getEmail());

        SmsNotification smsNotification = SmsNotification.builder()
                .user(user)
                .phoneNumber(phoneNumber)
                .message(message)
                .status("PENDING")
                .build();

        if (!twilioEnabled) {
            log.warn("Twilio is disabled. SMS will not be sent.");
            smsNotification.setStatus("DISABLED");
            return smsNotificationRepository.save(smsNotification);
        }

        if (twilioAccountSid == null || twilioAccountSid.isEmpty() ||
            twilioAuthToken == null || twilioAuthToken.isEmpty() ||
            twilioPhoneNumber == null || twilioPhoneNumber.isEmpty()) {
            log.error("Twilio configuration is incomplete. SMS will not be sent.");
            smsNotification.setStatus("CONFIG_ERROR");
            return smsNotificationRepository.save(smsNotification);
        }

        try {
            initializeTwilio();

            Message twilioMessage = Message.creator(
                    new PhoneNumber(phoneNumber),
                    new PhoneNumber(twilioPhoneNumber),
                    message
            ).create();

            smsNotification.setTwilioSid(twilioMessage.getSid());
            smsNotification.setStatus("SENT");
            smsNotification.setSentAt(LocalDateTime.now());

            log.info("SMS sent successfully to {} with SID: {}", phoneNumber, twilioMessage.getSid());

        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", phoneNumber, e.getMessage(), e);
            smsNotification.setStatus("FAILED");
        }

        return smsNotificationRepository.save(smsNotification);
    }

    /**
     * Send transaction confirmation SMS
     *
     * @param user the user to send SMS to
     * @param phoneNumber the phone number
     * @param vehicleRegistration the vehicle registration number
     * @param fuelAmount the fuel amount dispensed
     * @param totalPrice the total price
     * @param stationName the station name
     * @return the SMS notification record
     */
    @Transactional
    public SmsNotification sendTransactionConfirmationSms(User user, String phoneNumber, 
            String vehicleRegistration, String fuelAmount, String totalPrice, String stationName) {
        
        String message = String.format(
            "quota.app: Fuel dispensed for vehicle %s. Amount: %sL, Total: Rs.%s at %s. Thank you!",
            vehicleRegistration, fuelAmount, totalPrice, stationName
        );

        return sendSms(user, phoneNumber, message);
    }

    /**
     * Send quota warning SMS
     *
     * @param user the user to send SMS to
     * @param phoneNumber the phone number
     * @param vehicleRegistration the vehicle registration number
     * @param remainingQuota the remaining quota amount
     * @return the SMS notification record
     */
    @Transactional
    public SmsNotification sendQuotaWarningSms(User user, String phoneNumber, 
            String vehicleRegistration, String remainingQuota) {
        
        String message = String.format(
            "quota.app: Low quota warning for vehicle %s. Remaining: %sL. Please refill soon.",
            vehicleRegistration, remainingQuota
        );

        return sendSms(user, phoneNumber, message);
    }

    /**
     * Send verification SMS
     *
     * @param user the user to send SMS to
     * @param phoneNumber the phone number
     * @param verificationCode the verification code
     * @return the SMS notification record
     */
    @Transactional
    public SmsNotification sendVerificationSms(User user, String phoneNumber, String verificationCode) {
        String message = String.format(
            "quota.app: Your verification code is %s. Do not share this code with anyone.",
            verificationCode
        );

        return sendSms(user, phoneNumber, message);
    }

    /**
     * Get SMS history for a user
     *
     * @param user the user to get SMS history for
     * @return list of SMS notifications
     */
    @Transactional(readOnly = true)
    public List<SmsNotification> getSmsHistory(User user) {
        return smsNotificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /**
     * Get SMS notifications by status
     *
     * @param status the status to filter by
     * @return list of SMS notifications
     */
    @Transactional(readOnly = true)
    public List<SmsNotification> getSmsNotificationsByStatus(String status) {
        return smsNotificationRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    /**
     * Check if SMS service is properly configured
     *
     * @return true if SMS service is configured and enabled
     */
    public boolean isSmsConfigured() {
        return twilioEnabled && 
               twilioAccountSid != null && !twilioAccountSid.isEmpty() &&
               twilioAuthToken != null && !twilioAuthToken.isEmpty() &&
               twilioPhoneNumber != null && !twilioPhoneNumber.isEmpty();
    }
}
