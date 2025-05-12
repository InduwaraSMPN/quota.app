# Consolidated Database Schema for Quota.app

This directory contains SQL schema files for the Quota.app fuel management system. The system has been refactored to use a single centralized database instead of separate databases for each frontend application.

## Files

- `consolidated-schema.sql`: The unified schema that combines all tables from the previously separate schemas
- `frontend-admin.sql`: Original schema for admin frontend (now consolidated)
- `frontend-station.sql`: Original schema for station frontend (now consolidated)
- `frontend-vehicle.sql`: Original schema for vehicle frontend (now consolidated)

## Consolidation Changes

The following changes were made during the consolidation process:

1. **Eliminated Duplicate Definitions**:
   - Combined common enum types (`user_role`, `fuel_type`)
   - Consolidated the shared `users` table
   - Unified the `update_modified_column()` function and related triggers

2. **Renamed Constraints and Indexes**:
   - Added prefixes to constraint names to avoid conflicts (e.g., `fk_vehicle_owners_user` instead of `fk_user`)
   - Ensured all index names are unique across the schema

3. **Renamed Tables for Clarity**:
   - Renamed `owners` to `vehicle_owners` for clarity
   - Renamed `notifications` to `vehicle_notifications` to distinguish from other notification tables

4. **Established Cross-Schema Relationships**:
   - Connected `fuel_transactions` table to both `vehicles` and `fuel_stations` tables
   - Ensured all foreign key relationships are properly maintained

5. **Organized Schema Structure**:
   - Grouped tables by functional area (core, vehicle, station, admin, transactions)
   - Added comprehensive comments to explain table purposes and relationships

6. **Added Database Comments**:
   - Added comments to the database and all tables to improve documentation

## Database Connection

The consolidated schema is designed to work with the Azure PostgreSQL flexible server using the connection details configured in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://databasequotaapp.postgres.database.azure.com:5432/database.quota.app
spring.datasource.username=admindatabasequotaapp
spring.datasource.password=zNAj8TWuTh6:mfA
spring.datasource.driver-class-name=org.postgresql.Driver
```

## Implementation Notes

1. **Deployment**:
   - Execute the `consolidated-schema.sql` file on the Azure PostgreSQL server to create the unified schema
   - The original schema files are kept for reference but should not be used

2. **Data Migration**:
   - If you have existing data in separate databases, you'll need to migrate it to the consolidated schema
   - Ensure data integrity during migration, especially for tables with relationships

3. **Application Configuration**:
   - The backend application is already configured to use the consolidated database
   - No changes to the connection string are needed

4. **Schema Evolution**:
   - Future schema changes should be made to the consolidated schema
   - Consider using a migration tool like Flyway or Liquibase for future schema changes