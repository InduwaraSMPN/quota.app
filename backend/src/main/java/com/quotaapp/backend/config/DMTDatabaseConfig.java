package com.quotaapp.backend.config;

import java.util.HashMap;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import jakarta.persistence.EntityManagerFactory;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    entityManagerFactoryRef = "dmtEntityManagerFactory",
    transactionManagerRef = "dmtTransactionManager",
    basePackages = {"com.quotaapp.backend.repository.dmt"}
)
public class DMTDatabaseConfig {

    @Bean(name = "dmtDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.dmt")
    public DataSource dmtDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "dmtEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean dmtEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("dmtDataSource") DataSource dataSource) {

        Map<String, Object> properties = new HashMap<>();
        properties.put("hibernate.hbm2ddl.auto", "validate");
        properties.put("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        properties.put("hibernate.physical_naming_strategy", "org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl");
        properties.put("hibernate.implicit_naming_strategy", "org.hibernate.boot.model.naming.ImplicitNamingStrategyJpaCompliantImpl");

        return builder
                .dataSource(dataSource)
                .packages("com.quotaapp.backend.model.dmt")
                .persistenceUnit("dmt")
                .properties(properties)
                .build();
    }

    @Bean(name = "dmtTransactionManager")
    public PlatformTransactionManager dmtTransactionManager(
            @Qualifier("dmtEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
