package com.quotaapp.backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.quotaapp.backend.model.AdminNotification;
import com.quotaapp.backend.model.AdminUser;
import com.quotaapp.backend.model.FuelStation;
import com.quotaapp.backend.model.StationNotification;
import com.quotaapp.backend.repository.primary.AdminNotificationRepository;
import com.quotaapp.backend.repository.primary.AdminUserRepository;
import com.quotaapp.backend.repository.primary.FuelStationRepository;
import com.quotaapp.backend.repository.primary.StationNotificationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for managing notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final AdminNotificationRepository adminNotificationRepository;
    private final StationNotificationRepository stationNotificationRepository;
    private final AdminUserRepository adminUserRepository;
    private final FuelStationRepository fuelStationRepository;

    /**
     * Create a notification for an admin
     *
     * @param adminId the admin ID
     * @param title the notification title
     * @param message the notification message
     * @return the created notification
     */
    @Transactional
    public AdminNotification createAdminNotification(Long adminId, String title, String message) {
        Optional<AdminUser> adminOpt = adminUserRepository.findById(adminId);
        if (adminOpt.isEmpty()) {
            log.warn("Admin not found with ID: {}", adminId);
            throw new IllegalArgumentException("Admin not found");
        }

        AdminNotification notification = AdminNotification.builder()
                .admin(adminOpt.get())
                .title(title)
                .message(message)
                .isRead(false)
                .build();

        return adminNotificationRepository.save(notification);
    }

    /**
     * Create a notification for all admins
     *
     * @param title the notification title
     * @param message the notification message
     * @return the number of notifications created
     */
    @Transactional
    public int createNotificationForAllAdmins(String title, String message) {
        List<AdminUser> admins = adminUserRepository.findAll();
        List<AdminNotification> notifications = new ArrayList<>();

        for (AdminUser admin : admins) {
            AdminNotification notification = AdminNotification.builder()
                    .admin(admin)
                    .title(title)
                    .message(message)
                    .isRead(false)
                    .build();
            notifications.add(notification);
        }

        adminNotificationRepository.saveAll(notifications);
        return notifications.size();
    }

    /**
     * Create a notification for a station
     *
     * @param stationId the station ID
     * @param title the notification title
     * @param message the notification message
     * @return the created notification
     */
    @Transactional
    public StationNotification createStationNotification(Long stationId, String title, String message) {
        Optional<FuelStation> stationOpt = fuelStationRepository.findById(stationId);
        if (stationOpt.isEmpty()) {
            log.warn("Station not found with ID: {}", stationId);
            throw new IllegalArgumentException("Station not found");
        }

        StationNotification notification = StationNotification.builder()
                .station(stationOpt.get())
                .title(title)
                .message(message)
                .isRead(false)
                .build();

        return stationNotificationRepository.save(notification);
    }

    /**
     * Create a notification for all stations
     *
     * @param title the notification title
     * @param message the notification message
     * @return the number of notifications created
     */
    @Transactional
    public int createNotificationForAllStations(String title, String message) {
        List<FuelStation> stations = fuelStationRepository.findAll();
        List<StationNotification> notifications = new ArrayList<>();

        for (FuelStation station : stations) {
            StationNotification notification = StationNotification.builder()
                    .station(station)
                    .title(title)
                    .message(message)
                    .isRead(false)
                    .build();
            notifications.add(notification);
        }

        stationNotificationRepository.saveAll(notifications);
        return notifications.size();
    }

    /**
     * Get all notifications for an admin
     *
     * @param adminId the admin ID
     * @return a list of notifications
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAdminNotifications(Long adminId) {
        Optional<AdminUser> adminOpt = adminUserRepository.findById(adminId);
        if (adminOpt.isEmpty()) {
            log.warn("Admin not found with ID: {}", adminId);
            throw new IllegalArgumentException("Admin not found");
        }

        List<AdminNotification> notifications = adminNotificationRepository.findByAdminOrderByCreatedAtDesc(adminOpt.get());
        return convertAdminNotificationsToMap(notifications);
    }

    /**
     * Get all notifications for a station
     *
     * @param stationId the station ID
     * @return a list of notifications
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStationNotifications(Long stationId) {
        List<StationNotification> notifications = stationNotificationRepository.findByStationIdOrderByCreatedAtDesc(stationId);
        return convertStationNotificationsToMap(notifications);
    }

    /**
     * Mark an admin notification as read
     *
     * @param notificationId the notification ID
     * @param adminId the admin ID
     * @return true if the notification was marked as read, false otherwise
     */
    @Transactional
    public boolean markAdminNotificationAsRead(Long notificationId, Long adminId) {
        Optional<AdminNotification> notificationOpt = adminNotificationRepository.findById(notificationId);
        if (notificationOpt.isEmpty()) {
            log.warn("Admin notification not found with ID: {}", notificationId);
            return false;
        }

        AdminNotification notification = notificationOpt.get();

        // Verify that the notification belongs to the admin
        if (!notification.getAdmin().getId().equals(adminId)) {
            log.warn("Admin notification {} does not belong to admin {}", notificationId, adminId);
            return false;
        }

        notification.setRead(true);
        adminNotificationRepository.save(notification);
        return true;
    }

    /**
     * Mark a station notification as read
     *
     * @param notificationId the notification ID
     * @param stationId the station ID
     * @return true if the notification was marked as read, false otherwise
     */
    @Transactional
    public boolean markStationNotificationAsRead(Long notificationId, Long stationId) {
        Optional<StationNotification> notificationOpt = stationNotificationRepository.findById(notificationId);
        if (notificationOpt.isEmpty()) {
            log.warn("Station notification not found with ID: {}", notificationId);
            return false;
        }

        StationNotification notification = notificationOpt.get();

        // Verify that the notification belongs to the station
        if (!notification.getStation().getId().equals(stationId)) {
            log.warn("Station notification {} does not belong to station {}", notificationId, stationId);
            return false;
        }

        notification.setRead(true);
        stationNotificationRepository.save(notification);
        return true;
    }

    /**
     * Convert admin notifications to a map for API response
     *
     * @param notifications the notifications to convert
     * @return a list of maps
     */
    private List<Map<String, Object>> convertAdminNotificationsToMap(List<AdminNotification> notifications) {
        List<Map<String, Object>> result = new ArrayList<>();

        for (AdminNotification notification : notifications) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", notification.getId());
            map.put("title", notification.getTitle());
            map.put("message", notification.getMessage());
            map.put("type", determineNotificationType(notification.getTitle()));
            map.put("isRead", notification.isRead());
            map.put("createdAt", notification.getCreatedAt());
            result.add(map);
        }

        return result;
    }

    /**
     * Convert station notifications to a map for API response
     *
     * @param notifications the notifications to convert
     * @return a list of maps
     */
    private List<Map<String, Object>> convertStationNotificationsToMap(List<StationNotification> notifications) {
        List<Map<String, Object>> result = new ArrayList<>();

        for (StationNotification notification : notifications) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", notification.getId());
            map.put("title", notification.getTitle());
            map.put("message", notification.getMessage());
            map.put("type", determineNotificationType(notification.getTitle()));
            map.put("isRead", notification.isRead());
            map.put("createdAt", notification.getCreatedAt());
            result.add(map);
        }

        return result;
    }

    /**
     * Determine the notification type based on the title
     *
     * @param title the notification title
     * @return the notification type
     */
    private String determineNotificationType(String title) {
        String lowerTitle = title.toLowerCase();
        if (lowerTitle.contains("warning") || lowerTitle.contains("alert") ||
            lowerTitle.contains("maintenance") || lowerTitle.contains("issue")) {
            return "WARNING";
        } else if (lowerTitle.contains("success") || lowerTitle.contains("complete") ||
                  lowerTitle.contains("approved")) {
            return "SUCCESS";
        } else {
            return "INFO";
        }
    }

    /**
     * Initialize the system with notifications
     *
     * Note: Default notifications have been removed as requested.
     * This method is kept for future use if needed.
     */
    @Transactional
    public void initializeDefaultNotifications() {
        // Check if we have any admin notifications
        long adminNotificationCount = adminNotificationRepository.count();
        log.info("Found {} admin notifications", adminNotificationCount);

        // Check if we have any station notifications
        long stationNotificationCount = stationNotificationRepository.count();
        log.info("Found {} station notifications", stationNotificationCount);

        // Default notifications have been removed as requested
        log.info("Default notifications initialization skipped as requested");
    }
}
