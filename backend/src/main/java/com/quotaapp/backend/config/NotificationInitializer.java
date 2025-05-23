package com.quotaapp.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.quotaapp.backend.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Configuration class to initialize notifications on application startup
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class NotificationInitializer {

    private final NotificationService notificationService;

    /**
     * Initialize default notifications when the application starts
     * 
     * @return a CommandLineRunner that initializes notifications
     */
    @Bean
    public CommandLineRunner initializeNotifications() {
        return args -> {
            log.info("Initializing default notifications...");
            notificationService.initializeDefaultNotifications();
            log.info("Default notifications initialized successfully");
        };
    }
}
