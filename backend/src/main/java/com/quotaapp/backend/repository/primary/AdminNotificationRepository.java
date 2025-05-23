package com.quotaapp.backend.repository.primary;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.AdminNotification;
import com.quotaapp.backend.model.AdminUser;

/**
 * Repository for AdminNotification entity
 */
@Repository
public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {
    
    /**
     * Find all notifications for an admin
     * 
     * @param admin the admin to search for
     * @return a list of notifications for the admin
     */
    List<AdminNotification> findByAdminOrderByCreatedAtDesc(AdminUser admin);
    
    /**
     * Find all unread notifications for an admin
     * 
     * @param admin the admin to search for
     * @return a list of unread notifications for the admin
     */
    List<AdminNotification> findByAdminAndIsReadFalseOrderByCreatedAtDesc(AdminUser admin);
    
    /**
     * Count unread notifications for an admin
     * 
     * @param admin the admin to count for
     * @return the count of unread notifications
     */
    long countByAdminAndIsReadFalse(AdminUser admin);
}
