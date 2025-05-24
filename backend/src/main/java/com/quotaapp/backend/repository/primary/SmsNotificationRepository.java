package com.quotaapp.backend.repository.primary;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.SmsNotification;
import com.quotaapp.backend.model.User;

/**
 * Repository for SmsNotification entity
 */
@Repository
public interface SmsNotificationRepository extends JpaRepository<SmsNotification, Long> {
    
    /**
     * Find all SMS notifications for a user
     * 
     * @param user the user to search for
     * @return a list of SMS notifications for the user
     */
    List<SmsNotification> findByUserOrderByCreatedAtDesc(User user);
    
    /**
     * Find SMS notifications by status
     * 
     * @param status the status to search for
     * @return a list of SMS notifications with the given status
     */
    List<SmsNotification> findByStatusOrderByCreatedAtDesc(String status);
    
    /**
     * Find SMS notifications by phone number
     * 
     * @param phoneNumber the phone number to search for
     * @return a list of SMS notifications for the phone number
     */
    List<SmsNotification> findByPhoneNumberOrderByCreatedAtDesc(String phoneNumber);
}
