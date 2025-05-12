# Consolidated Database Schema for Quota.app

This directory contains SQL schema files for the Quota.app fuel management system. The system has been refactored to use a single centralized database for the main application, with a separate database for the Department of Motor Traffic (DMT) integration.

## Files

- `consolidated-schema-simplified.sql`: The unified schema for the main application (simplified version)
- `dmt-schema.sql`: Schema for the separate Department of Motor Traffic database
- `frontend-admin.sql`: Original schema for admin frontend (kept for reference)
- `frontend-station.sql`: Original schema for station frontend (kept for reference)
- `frontend-vehicle.sql`: Original schema for vehicle frontend (kept for reference)
- `consolidated-schema.sql`: Original consolidated schema (kept for reference)

## Consolidation Changes

The following changes were made during the consolidation process:

1. **Eliminated Duplicate Definitions**:
   - Combined common enum types (`user_role`, `fuel_type`)
   - Consolidated the shared `users` table
   - Unified the `update_modified_column()` function

2. **Renamed Tables for Clarity**:
   - Renamed `owners` to `vehicle_owners` for clarity
   - Renamed `notifications` to `vehicle_notifications` to distinguish from other notification tables

3. **Established Cross-Schema Relationships**:
   - Connected `fuel_transactions` table to both `vehicles` and `fuel_stations` tables
   - Ensured all foreign key relationships are properly maintained

4. **Organized Schema Structure**:
   - Grouped tables by functional area (core, vehicle, station, admin, transactions)

5. **Simplified Schema**:
   - Removed all CREATE INDEX statements for simplicity (can be added later for performance optimization)
   - Removed all CREATE TRIGGER statements (can be added later if needed)
   - Removed all COMMENT ON statements

6. **Separated DMT Database**:
   - Created a separate schema file for the Department of Motor Traffic database
   - Added sample vehicle records for testing
   - Created a dedicated API user for the quota.app system to connect to the DMT database

## Database Connection

The consolidated schema is designed to work with the Azure PostgreSQL flexible server using the connection details configured in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://databasequotaapp.postgres.database.azure.com:5432/database.quota.app
spring.datasource.username=admindatabasequotaapp
spring.datasource.password=zNAj8TWuTh6:mfA
spring.datasource.driver-class-name=org.postgresql.Driver
```

For the DMT database, you'll need to configure a separate connection in your application.

## Implementation Notes

1. **Deployment**:
   - Execute the `consolidated-schema-simplified.sql` file on the Azure PostgreSQL server to create the main application schema
   - Execute the `dmt-schema.sql` file on a separate database instance to create the DMT database
   - The original schema files are kept for reference but should not be used

2. **Data Migration**:
   - If you have existing data in separate databases, you'll need to migrate it to the consolidated schema
   - Ensure data integrity during migration, especially for tables with relationships

3. **Application Configuration**:
   - The backend application is already configured to use the consolidated database
   - You'll need to add a separate configuration for connecting to the DMT database

4. **Schema Evolution**:
   - Future schema changes should be made to the consolidated schema
   - Consider using a migration tool like Flyway or Liquibase for future schema changes

## Project Requirements Support

The consolidated schema supports the following project requirements:

1. **Vehicle Owner Registration**:
   - `users` table with `VEHICLE_OWNER` role
   - `vehicle_owners` table for owner details
   - `vehicles` table for vehicle information

2. **Vehicle Verification**:
   - Separate DMT database with `vehicle_records` table
   - `vehicle_verification_requests` table to track verification status

3. **QR Code Generation**:
   - `qr_codes` table to store QR code data for verified vehicles

4. **Fuel Station Owner Registration**:
   - `users` table with `STATION_OWNER` role
   - `station_owners` table for owner details
   - `fuel_stations` table for station information

5. **Admin Portal**:
   - `users` table with `ADMIN` role
   - `admin_users` table for admin details
   - `admin_permissions` and `admin_user_permissions` tables for access control
   - `admin_activity_logs` table for audit trails

6. **Fuel Station Operators**:
   - `users` table with `STATION_OPERATOR` role
   - `station_operators` table for operator details

7. **Fuel Quota Management**:
   - `fuel_quotas` table to track quota allocations
   - `fuel_transactions` table to record fuel consumption

8. **SMS Notifications**:
   - `sms_notifications` table to track SMS messages sent via Twilio

The schema is designed to support all the required functionality for the fuel quota management system, including the Android mobile app for fuel station operators.