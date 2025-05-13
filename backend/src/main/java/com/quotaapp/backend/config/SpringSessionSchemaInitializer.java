package com.quotaapp.backend.config;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

/**
 * Utility class to manually initialize the Spring Session schema if needed.
 * This is a fallback mechanism in case the automatic initialization fails.
 */
@Configuration
public class SpringSessionSchemaInitializer {
    
    private static final Logger logger = LoggerFactory.getLogger(SpringSessionSchemaInitializer.class);
    
    /**
     * Check if Spring Session tables exist and create them if they don't
     * 
     * @param dataSource the primary DataSource
     * @return CommandLineRunner that checks and initializes the schema
     */
    @Bean
    public CommandLineRunner initializeSpringSessionSchema(@Qualifier("dataSource") DataSource dataSource) {
        return args -> {
            JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
            
            try {
                // Check if SPRING_SESSION table exists
                jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'spring_session'", 
                    Integer.class
                );
                logger.info("Spring Session tables already exist");
            } catch (Exception e) {
                logger.warn("Spring Session tables do not exist. Creating them now...");
                
                try {
                    // Initialize schema using the standard Spring Session schema script
                    ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
                    populator.addScript(new ClassPathResource("org/springframework/session/jdbc/schema-postgresql.sql"));
                    populator.setContinueOnError(true);
                    populator.execute(dataSource);
                    
                    logger.info("Successfully created Spring Session tables");
                } catch (Exception ex) {
                    logger.error("Failed to create Spring Session tables automatically", ex);
                    
                    try {
                        // Fallback to our custom script
                        ResourceDatabasePopulator customPopulator = new ResourceDatabasePopulator();
                        customPopulator.addScript(new ClassPathResource("sql/spring-session-schema.sql"));
                        customPopulator.setContinueOnError(true);
                        customPopulator.execute(dataSource);
                        
                        logger.info("Successfully created Spring Session tables using custom script");
                    } catch (Exception customEx) {
                        logger.error("Failed to create Spring Session tables using custom script", customEx);
                        logger.error("Please manually run the SQL script to create the Spring Session tables");
                    }
                }
            }
        };
    }
}
