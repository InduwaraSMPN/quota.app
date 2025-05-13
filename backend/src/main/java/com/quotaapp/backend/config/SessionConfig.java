package com.quotaapp.backend.config;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.DataSourceInitializer;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.jdbc.support.JdbcTransactionManager;
import org.springframework.session.jdbc.config.annotation.SpringSessionDataSource;
import org.springframework.session.jdbc.config.annotation.web.http.EnableJdbcHttpSession;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Configuration for Spring Session using JDBC
 * This explicitly configures Spring Session to use the primary DataSource
 */
@Configuration
@EnableJdbcHttpSession
public class SessionConfig {

    /**
     * Explicitly specify which DataSource Spring Session should use
     *
     * @param dataSource the primary DataSource
     * @return the DataSource for Spring Session
     */
    @Bean
    @SpringSessionDataSource
    public DataSource springSessionDataSource(@Qualifier("dataSource") DataSource dataSource) {
        return dataSource;
    }

    /**
     * Configure the JdbcTemplate for Spring Session to use the primary DataSource
     *
     * @param dataSource the primary DataSource
     * @return JdbcTemplate configured with the primary DataSource
     */
    @Bean
    @Primary
    public JdbcTemplate springSessionJdbcTemplate(@Qualifier("dataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    /**
     * Configure the transaction manager for Spring Session
     *
     * @param dataSource the primary DataSource
     * @return PlatformTransactionManager for Spring Session
     */
    @Bean
    public PlatformTransactionManager springSessionTransactionManager(@Qualifier("dataSource") DataSource dataSource) {
        return new JdbcTransactionManager(dataSource);
    }

    /**
     * Configure the transaction template for Spring Session
     *
     * @param transactionManager the transaction manager for Spring Session
     * @return TransactionTemplate for Spring Session
     */
    @Bean
    public TransactionTemplate springSessionTransactionTemplate(PlatformTransactionManager springSessionTransactionManager) {
        return new TransactionTemplate(springSessionTransactionManager);
    }

    /**
     * Initialize the Spring Session schema
     * This ensures the required tables are created in the database
     *
     * @param dataSource the primary DataSource
     * @return DataSourceInitializer for Spring Session
     */
    @Bean
    public DataSourceInitializer springSessionDataSourceInitializer(@Qualifier("dataSource") DataSource dataSource) {
        DataSourceInitializer initializer = new DataSourceInitializer();
        initializer.setDataSource(dataSource);

        ResourceDatabasePopulator databasePopulator = new ResourceDatabasePopulator();
        databasePopulator.addScript(new ClassPathResource("org/springframework/session/jdbc/schema-postgresql.sql"));
        databasePopulator.setContinueOnError(true);
        initializer.setDatabasePopulator(databasePopulator);

        return initializer;
    }
}
