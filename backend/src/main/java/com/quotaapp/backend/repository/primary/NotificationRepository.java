package com.quotaapp.backend.repository.primary;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.Notification;
import com.quotaapp.backend.model.User;

/**
 * Repository for Notification entity
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    /**
     * Find all notifications for a user
     * 
     * @param user the user to search for
     * @return a list of notifications for the user
     */
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    
    /**
     * Find all unread notifications for a user
     * 
     * @param user the user to search for
     * @return a list of unread notifications for the user
     */
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);
    
    /**
     * Count unread notifications for a user
     * 
     * @param user the user to count for
     * @return the count of unread notifications
     */
    long countByUserAndIsReadFalse(User user);
    
    /**
     * Find notifications by type for a user
     * 
     * @param user the user to search for
     * @param type the notification type
     * @return a list of notifications for the user by type
     */
    List<Notification> findByUserAndTypeOrderByCreatedAtDesc(User user, String type);
}
