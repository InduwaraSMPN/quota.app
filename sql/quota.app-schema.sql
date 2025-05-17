-- COMMON TYPES

-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('VEHICLE_OWNER', 'STATION_OWNER', 'ADMIN', 'STATION_OPERATOR');
CREATE TYPE fuel_type AS ENUM ('92 OCTANE PETROL', '95 OCTANE PETROL', 'AUTO DIESEL', 'SUPER DIESEL', 'KEROSENE');
CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');


-- CORE TABLES

-- Create users table (shared across all frontends)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create refresh_tokens table for JWT authentication
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- ADMIN RELATED TABLES


-- Create departments table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert departments
INSERT INTO departments (name, description) VALUES
    ('operations', 'Operations Department'),
    ('monitoring', 'Monitoring & Surveillance Department'),
    ('distribution', 'Distribution Management Department'),
    ('support', 'Technical Support Department'),
    ('admin', 'Administration Department');

-- Create admin_users table
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    department_id INTEGER NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    emergency_contact_number VARCHAR(15) NOT NULL,
    address TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_users_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_admin_users_department FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Create admin_activity_logs table
CREATE TABLE admin_activity_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_activity_logs_admin FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Create admin_notifications table
CREATE TABLE admin_notifications (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_notifications_admin FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
);


-- VEHICLE OWNER RELATED TABLES


-- Create vehicle_classes table to store predefined vehicle classes
CREATE TABLE vehicle_classes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(5) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    fuel_quota_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert predefined vehicle classes with their fuel quota amounts
INSERT INTO vehicle_classes (code, name, description, fuel_quota_amount) VALUES
    ('A1', 'Light motor cycles', 'Light motor cycles with engine capacity not exceeding 100cc', 14.0),
    ('A', 'Motorcycles', 'Motorcycles with engine capacity exceeding 100cc', 14.0),
    ('B1', 'Motor Tricycle or van', 'Three-wheeled vehicles and light vans', 14.0),
    ('B', 'Dual purpose Motor vehicle', 'Dual purpose vehicles like cars and jeeps', 40.0),
    ('C1', 'Light Motor Lorry', 'Light motor lorries with gross vehicle weight less than 17,000 kg', 125.0),
    ('C', 'Motor Lorry', 'Motor lorries with gross vehicle weight 17,000 kg or more', 125.0),
    ('CE', 'Heavy Motor Lorry combination', 'Heavy motor lorry combinations', 125.0),
    ('D1', 'Light Motor Coach', 'Light motor coaches with seating capacity not exceeding 33 passengers', 125.0),
    ('D', 'Motor Coach', 'Motor coaches with seating capacity exceeding 33 passengers', 125.0),
    ('DE', 'Heavy Motor Coach combination', 'Heavy motor coach combinations', 125.0),
    ('G1', 'Hand Tractors', 'Hand tractors', 15.0),
    ('G', 'Land Vehicle', 'Land vehicles including agricultural tractors', 15.0),
    ('J', 'Special purpose Vehicle', 'Special purpose vehicles', 30.0);

-- Create vehicle_owners table (renamed from owners for clarity)
CREATE TABLE vehicle_owners (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    nic_number VARCHAR(12) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_owners_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create vehicles table
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    registration_number VARCHAR(10) NOT NULL UNIQUE,
    engine_number VARCHAR(50) NOT NULL,
    chassis_number VARCHAR(50) NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year_of_manufacture INTEGER NOT NULL,
    vehicle_class_id INTEGER NOT NULL,
    type_of_body VARCHAR(50) NOT NULL,
    fuel_type fuel_type NOT NULL,
    engine_capacity INTEGER NOT NULL,
    color VARCHAR(30) NOT NULL,
    gross_vehicle_weight INTEGER NOT NULL,
    date_of_first_registration DATE NOT NULL,
    country_of_origin VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicles_owner FOREIGN KEY (owner_id) REFERENCES vehicle_owners(id) ON DELETE CASCADE,
    CONSTRAINT fk_vehicles_vehicle_class FOREIGN KEY (vehicle_class_id) REFERENCES vehicle_classes(id),
    CONSTRAINT valid_year_of_manufacture CHECK (year_of_manufacture BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE)),
    CONSTRAINT positive_engine_capacity CHECK (engine_capacity > 0),
    CONSTRAINT positive_gross_vehicle_weight CHECK (gross_vehicle_weight > 0),
    CONSTRAINT valid_date_of_first_registration CHECK (date_of_first_registration <= CURRENT_DATE)
);

-- Create vehicle_verification_requests table to track verification status
CREATE TABLE vehicle_verification_requests (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    status verification_status NOT NULL DEFAULT 'PENDING',
    verification_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    verified_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_verification_requests_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT fk_vehicle_verification_requests_admin FOREIGN KEY (verified_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Create fuel_quotas table to track quota allocations
CREATE TABLE fuel_quotas (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    allocated_amount DECIMAL(10, 2) NOT NULL,
    remaining_amount DECIMAL(10, 2) NOT NULL,
    allocation_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fuel_quotas_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT positive_quota_amount CHECK (allocated_amount > 0),
    CONSTRAINT positive_remaining_amount CHECK (remaining_amount >= 0),
    CONSTRAINT valid_quota_dates CHECK (allocation_date <= expiry_date)
);

-- Create qr_codes table to store QR code information for vehicles
CREATE TABLE qr_codes (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL UNIQUE,
    qr_code_data TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_qr_codes_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Create vehicle_notifications table for vehicle owner notifications
CREATE TABLE vehicle_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- STATION OWNER RELATED TABLES


-- Create station_owners table
CREATE TABLE station_owners (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    nic_number VARCHAR(12) NOT NULL UNIQUE,
    contact_number VARCHAR(15) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_station_owners_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create provinces table
CREATE TABLE provinces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert provinces
INSERT INTO provinces (name) VALUES
    ('Central'),
    ('Eastern'),
    ('North Central'),
    ('Northern'),
    ('North Western'),
    ('Sabaragamuwa'),
    ('Southern'),
    ('Uva'),
    ('Western');

-- Create districts table
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    province_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_districts_province FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE CASCADE,
    CONSTRAINT uq_district_name_province UNIQUE (province_id, name)
);

-- Insert districts
INSERT INTO districts (province_id, name) VALUES
    (1, 'Kandy'), (1, 'Matale'), (1, 'Nuwara Eliya'), -- Central
    (2, 'Ampara'), (2, 'Batticaloa'), (2, 'Trincomalee'), -- Eastern
    (3, 'Anuradhapura'), (3, 'Polonnaruwa'), -- North Central
    (4, 'Jaffna'), (4, 'Kilinochchi'), (4, 'Mannar'), (4, 'Mullaitivu'), (4, 'Vavuniya'), -- Northern
    (5, 'Kurunegala'), (5, 'Puttalam'), -- North Western
    (6, 'Kegalle'), (6, 'Ratnapura'), -- Sabaragamuwa
    (7, 'Galle'), (7, 'Hambantota'), (7, 'Matara'), -- Southern
    (8, 'Badulla'), (8, 'Monaragala'), -- Uva
    (9, 'Colombo'), (9, 'Gampaha'), (9, 'Kalutara'); -- Western

-- Create fuel_stations table
CREATE TABLE fuel_stations (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    business_registration_number VARCHAR(50) NOT NULL UNIQUE,
    business_name VARCHAR(100) NOT NULL,
    business_address TEXT NOT NULL,
    province_id INTEGER NOT NULL,
    district_id INTEGER NOT NULL,
    station_name VARCHAR(100) NOT NULL,
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    fuel_retail_license_number VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    verification_status verification_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fuel_stations_owner FOREIGN KEY (owner_id) REFERENCES station_owners(id) ON DELETE CASCADE,
    CONSTRAINT fk_fuel_stations_province FOREIGN KEY (province_id) REFERENCES provinces(id),
    CONSTRAINT fk_fuel_stations_district FOREIGN KEY (district_id) REFERENCES districts(id),
    CONSTRAINT valid_business_hours CHECK (opening_time != closing_time)
);

-- Create station_verification_requests table to track verification status
CREATE TABLE station_verification_requests (
    id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL,
    status verification_status NOT NULL DEFAULT 'PENDING',
    verification_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    verified_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_station_verification_requests_station FOREIGN KEY (station_id) REFERENCES fuel_stations(id) ON DELETE CASCADE,
    CONSTRAINT fk_station_verification_requests_admin FOREIGN KEY (verified_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Create station_fuel_types table (many-to-many relationship)
CREATE TABLE station_fuel_types (
    id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL,
    fuel_type fuel_type NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_station_fuel_types_station FOREIGN KEY (station_id) REFERENCES fuel_stations(id) ON DELETE CASCADE,
    CONSTRAINT uq_station_fuel_type UNIQUE (station_id, fuel_type)
);

-- Create fuel_inventory table to track fuel stock at stations
CREATE TABLE fuel_inventory (
    id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL,
    fuel_type fuel_type NOT NULL,
    current_stock DECIMAL(10, 2) NOT NULL,
    capacity DECIMAL(10, 2) NOT NULL,
    last_refill_date TIMESTAMP WITH TIME ZONE,
    next_refill_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fuel_inventory_station FOREIGN KEY (station_id) REFERENCES fuel_stations(id) ON DELETE CASCADE,
    CONSTRAINT uq_station_fuel_inventory UNIQUE (station_id, fuel_type)
);

-- Create station_notifications table for station-specific notifications
CREATE TABLE station_notifications (
    id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_station_notifications_station FOREIGN KEY (station_id) REFERENCES fuel_stations(id) ON DELETE CASCADE
);

-- Create station_operators table
CREATE TABLE station_operators (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    station_id INTEGER NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_station_operators_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_station_operators_station FOREIGN KEY (station_id) REFERENCES fuel_stations(id) ON DELETE CASCADE,
    CONSTRAINT uq_station_operator_employee_id UNIQUE (station_id, employee_id)
);

-- Create system_settings table
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default system settings
INSERT INTO system_settings (setting_key, setting_value, description, is_public) VALUES
    ('default_quota_amount', '20', 'Default fuel quota amount in liters', true),
    ('quota_reset_period', '30', 'Number of days before quota resets', true),
    ('max_vehicles_per_owner', '3', 'Maximum number of vehicles per owner', true),
    ('enable_sms_notifications', 'true', 'Whether SMS notifications are enabled', false),
    ('enable_email_notifications', 'true', 'Whether email notifications are enabled', false),
    ('maintenance_mode', 'false', 'Whether the system is in maintenance mode', true),
    ('require_station_verification', 'true', 'Whether fuel stations require admin verification before becoming active', true);


-- TRANSACTION RELATED TABLES


-- Create fuel_transactions table to track fuel sales
-- This table connects vehicles and stations
CREATE TABLE fuel_transactions (
    id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    fuel_type fuel_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fuel_transactions_station FOREIGN KEY (station_id) REFERENCES fuel_stations(id) ON DELETE CASCADE,
    CONSTRAINT fk_fuel_transactions_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT positive_transaction_amount CHECK (amount > 0),
    CONSTRAINT positive_unit_price CHECK (unit_price > 0),
    CONSTRAINT positive_total_price CHECK (total_price > 0),
    CONSTRAINT valid_total_price CHECK (ROUND(amount * unit_price, 2) = total_price)
);


-- EMAIL VERIFICATION SYSTEM


-- Create email_verification_tokens table to store verification codes
CREATE TABLE email_verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_email_verification_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT valid_expiry_date CHECK (expires_at > created_at)
);


-- SMS NOTIFICATION SYSTEM


-- Create sms_notifications table to track SMS messages sent via Twilio
CREATE TABLE sms_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    message TEXT NOT NULL,
    twilio_sid VARCHAR(50),
    status VARCHAR(20) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sms_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);