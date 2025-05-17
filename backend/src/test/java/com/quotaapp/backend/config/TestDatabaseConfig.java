package com.quotaapp.backend.config;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseBuilder;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import jakarta.persistence.EntityManagerFactory;
import java.util.HashMap;
import java.util.Map;

/**
 * Test configuration that replaces the real database connections with H2 in-memory databases
 * for testing purposes. This prevents tests from requiring connections to external databases.
 */
@TestConfiguration
@Profile("test")
public class TestDatabaseConfig {

    /**
     * Creates an in-memory H2 database for the primary database in tests
     */
    @Primary
    @Bean(name = "dataSource")
    public DataSource dataSource() {
        return new EmbeddedDatabaseBuilder()
                .setType(EmbeddedDatabaseType.H2)
                .setName("primary-test-db")
                .build();
    }

    /**
     * Creates an in-memory H2 database for the DMT database in tests
     */
    @Bean(name = "dmtDataSource")
    public DataSource dmtDataSource() {
        return new EmbeddedDatabaseBuilder()
                .setType(EmbeddedDatabaseType.H2)
                .setName("dmt-test-db")
                .build();
    }

    /**
     * Configures the primary entity manager factory for tests with create-drop schema generation
     */
    @Primary
    @Bean(name = "entityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @org.springframework.beans.factory.annotation.Qualifier("dataSource") DataSource dataSource) {

        Map<String, Object> properties = new HashMap<>();
        // Use create-drop for tests instead of update
        properties.put("hibernate.hbm2ddl.auto", "create-drop");
        properties.put("hibernate.dialect", "org.hibernate.dialect.H2Dialect");
        properties.put("hibernate.physical_naming_strategy", "org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl");
        properties.put("hibernate.implicit_naming_strategy", "org.hibernate.boot.model.naming.ImplicitNamingStrategyJpaCompliantImpl");

        return builder
                .dataSource(dataSource)
                .packages("com.quotaapp.backend.model")
                .persistenceUnit("primary")
                .properties(properties)
                .build();
    }

    /**
     * Configures the primary transaction manager for tests
     */
    @Primary
    @Bean(name = "transactionManager")
    public PlatformTransactionManager transactionManager(
            @org.springframework.beans.factory.annotation.Qualifier("entityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }

    /**
     * Configures the DMT entity manager factory for tests with create-drop schema generation
     */
    @Bean(name = "dmtEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean dmtEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @org.springframework.beans.factory.annotation.Qualifier("dmtDataSource") DataSource dataSource) {

        Map<String, Object> properties = new HashMap<>();
        // Use create-drop for tests instead of validate
        properties.put("hibernate.hbm2ddl.auto", "create-drop");
        properties.put("hibernate.dialect", "org.hibernate.dialect.H2Dialect");
        properties.put("hibernate.physical_naming_strategy", "org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl");
        properties.put("hibernate.implicit_naming_strategy", "org.hibernate.boot.model.naming.ImplicitNamingStrategyJpaCompliantImpl");

        return builder
                .dataSource(dataSource)
                .packages("com.quotaapp.backend.model.dmt")
                .persistenceUnit("dmt")
                .properties(properties)
                .build();
    }

    /**
     * Configures the DMT transaction manager for tests
     */
    @Bean(name = "dmtTransactionManager")
    public PlatformTransactionManager dmtTransactionManager(
            @org.springframework.beans.factory.annotation.Qualifier("dmtEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
