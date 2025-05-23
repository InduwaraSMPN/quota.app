package com.quotaapp.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import lombok.extern.slf4j.Slf4j;

/**
 * Web configuration for CORS and other web-related settings
 */
@Configuration
@EnableWebMvc
@Slf4j
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        log.info("Configuring CORS mappings");
        
        registry.addMapping("/**")
            .allowedOrigins(
                "http://localhost:3000",  // Vehicle frontend
                "http://localhost:3001",  // Station frontend
                "http://localhost:3002"   // Admin frontend
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
            .allowedHeaders(
                "Authorization", 
                "Content-Type", 
                "X-Requested-With", 
                "Accept", 
                "Origin", 
                "Access-Control-Request-Method", 
                "Access-Control-Request-Headers"
            )
            .exposedHeaders(
                "Access-Control-Allow-Origin", 
                "Access-Control-Allow-Credentials"
            )
            .allowCredentials(true)
            .maxAge(3600);
        
        log.info("CORS mappings configured");
    }
}
