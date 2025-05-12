-- Consolidated database schema for quota.app system
-- This schema combines the previously separate schemas for vehicle, station, and admin frontends
-- into a single unified database schema for use with Azure PostgreSQL flexible server.

-- =============================================
-- COMMON TYPES AND FUNCTIONS
-- =============================================

-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('VEHICLE_OWNER', 'STATION_OWNER', 'ADMIN', 'STATION_OPERATOR');
CREATE TYPE fuel_type AS ENUM ('92 OCTANE PETROL', '95 OCTANE PETROL', 'AUTO DIESEL', 'SUPER DIESEL', 'KEROSENE');
CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- Create function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- CORE TABLES
-- =============================================

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

-- Create index on email for faster login queries
CREATE INDEX idx_users_email ON users(email);

-- Create refresh_tokens table for JWT authentication
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster token lookups
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- =============================================
-- VEHICLE OWNER RELATED TABLES
-- =============================================

-- Create vehicle_classes table to store predefined vehicle classes
CREATE TABLE vehicle_classes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(5) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert predefined vehicle classes
INSERT INTO vehicle_classes (code, name, description) VALUES
    ('A1', 'Light motor cycles', 'Light motor cycles with engine capacity not exceeding 100cc'),
    ('A', 'Motorcycles', 'Motorcycles with engine capacity exceeding 100cc'),
    ('B1', 'Motor Tricycle or van', 'Three-wheeled vehicles and light vans'),
    ('B', 'Dual purpose Motor vehicle', 'Dual purpose vehicles like cars and jeeps'),
    ('C1', 'Light Motor Lorry', 'Light motor lorries with gross vehicle weight less than 17,000 kg'),
    ('C', 'Motor Lorry', 'Motor lorries with gross vehicle weight 17,000 kg or more'),
    ('CE', 'Heavy Motor Lorry combination', 'Heavy motor lorry combinations'),
    ('D1', 'Light Motor Coach', 'Light motor coaches with seating capacity not exceeding 33 passengers'),
    ('D', 'Motor Coach', 'Motor coaches with seating capacity exceeding 33 passengers'),
    ('DE', 'Heavy Motor Coach combination', 'Heavy motor coach combinations'),
    ('G1', 'Hand Tractors', 'Hand tractors'),
    ('G', 'Land Vehicle', 'Land vehicles including agricultural tractors'),
    ('J', 'Special purpose Vehicle', 'Special purpose vehicles');

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

-- Create indexes for faster lookups
CREATE INDEX idx_vehicle_owners_nic ON vehicle_owners(nic_number);
CREATE INDEX idx_vehicle_owners_contact ON vehicle_owners(contact_number);

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
    CONSTRAINT fk_vehicles_vehicle_class FOREIGN KEY (vehicle_class_id) REFERENCES vehicle_classes(id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_vehicles_registration ON vehicles(registration_number);
CREATE INDEX idx_vehicles_owner ON vehicles(owner_id);
CREATE INDEX idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX idx_vehicles_class ON vehicles(vehicle_class_id);
CREATE INDEX idx_vehicles_fuel_type ON vehicles(fuel_type);

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
    CONSTRAINT fk_fuel_quotas_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Create index for faster quota lookups
CREATE INDEX idx_fuel_quotas_vehicle ON fuel_quotas(vehicle_id);
CREATE INDEX idx_fuel_quotas_dates ON fuel_quotas(allocation_date, expiry_date);

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

-- Create index for faster QR code lookups
CREATE INDEX idx_qr_codes_vehicle ON qr_codes(vehicle_id);

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

-- Create index for faster notification lookups
CREATE INDEX idx_vehicle_notifications_user ON vehicle_notifications(user_id);
CREATE INDEX idx_vehicle_notifications_unread ON vehicle_notifications(user_id, is_read) WHERE is_read = FALSE;

-- =============================================
-- STATION OWNER RELATED TABLES
-- =============================================

-- Create station_owners table
CREATE TABLE station_owners (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    nic_number VARCHAR(12) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_station_owners_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for faster lookups
CREATE INDEX idx_station_owners_nic ON station_owners(nic_number);
CREATE INDEX idx_station_owners_contact ON station_owners(contact_number);

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fuel_stations_owner FOREIGN KEY (owner_id) REFERENCES station_owners(id) ON DELETE CASCADE,
    CONSTRAINT fk_fuel_stations_province FOREIGN KEY (province_id) REFERENCES provinces(id),
    CONSTRAINT fk_fuel_stations_district FOREIGN KEY (district_id) REFERENCES districts(id),
    CONSTRAINT check_district_province FOREIGN KEY (province_id, district_id) REFERENCES districts(province_id, id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_fuel_stations_owner ON fuel_stations(owner_id);
CREATE INDEX idx_fuel_stations_location ON fuel_stations(province_id, district_id);
CREATE INDEX idx_fuel_stations_brn ON fuel_stations(business_registration_number);
CREATE INDEX idx_fuel_stations_license ON fuel_stations(fuel_retail_license_number);

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

-- Create index for faster lookups
CREATE INDEX idx_station_fuel_types_station ON station_fuel_types(station_id);
CREATE INDEX idx_station_fuel_types_fuel_type ON station_fuel_types(fuel_type);
CREATE INDEX idx_station_fuel_types_availability ON station_fuel_types(is_available);

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

-- Create index for faster lookups
CREATE INDEX idx_fuel_inventory_station ON fuel_inventory(station_id);
CREATE INDEX idx_fuel_inventory_fuel_type ON fuel_inventory(fuel_type);
CREATE INDEX idx_fuel_inventory_refill ON fuel_inventory(next_refill_date);

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

-- Create index for faster notification lookups
CREATE INDEX idx_station_notifications_station ON station_notifications(station_id);
CREATE INDEX idx_station_notifications_unread ON station_notifications(station_id, is_read) WHERE is_read = FALSE;

-- =============================================
-- ADMIN RELATED TABLES
-- =============================================

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

-- Create indexes for faster lookups
CREATE INDEX idx_admin_users_employee_id ON admin_users(employee_id);
CREATE INDEX idx_admin_users_department ON admin_users(department_id);

-- Create admin_permissions table
CREATE TABLE admin_permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert basic permissions
INSERT INTO admin_permissions (name, description) VALUES
    ('view_users', 'View user accounts'),
    ('create_users', 'Create new user accounts'),
    ('edit_users', 'Edit existing user accounts'),
    ('delete_users', 'Delete user accounts'),
    ('view_vehicles', 'View vehicle information'),
    ('edit_vehicles', 'Edit vehicle information'),
    ('view_stations', 'View fuel station information'),
    ('edit_stations', 'Edit fuel station information'),
    ('view_quotas', 'View fuel quota information'),
    ('edit_quotas', 'Edit fuel quota allocations'),
    ('view_transactions', 'View fuel transactions'),
    ('generate_reports', 'Generate system reports'),
    ('system_settings', 'Modify system settings'),
    ('manage_admins', 'Manage admin users');

-- Create admin_user_permissions table (many-to-many relationship)
CREATE TABLE admin_user_permissions (
    id SERIAL PRIMARY KEY,
    admin_user_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_user_permissions_admin_user FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_admin_user_permissions_permission FOREIGN KEY (permission_id) REFERENCES admin_permissions(id) ON DELETE CASCADE,
    CONSTRAINT uq_admin_user_permission UNIQUE (admin_user_id, permission_id)
);

-- Create index for faster lookups
CREATE INDEX idx_admin_user_permissions_user ON admin_user_permissions(admin_user_id);
CREATE INDEX idx_admin_user_permissions_permission ON admin_user_permissions(permission_id);

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

-- Create index for faster lookups
CREATE INDEX idx_admin_activity_logs_admin ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_logs_action ON admin_activity_logs(action);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);

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

-- Create index for faster notification lookups
CREATE INDEX idx_admin_notifications_admin ON admin_notifications(admin_id);
CREATE INDEX idx_admin_notifications_unread ON admin_notifications(admin_id, is_read) WHERE is_read = FALSE;

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
    ('maintenance_mode', 'false', 'Whether the system is in maintenance mode', true);

-- =============================================
-- TRANSACTION RELATED TABLES
-- =============================================

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
    CONSTRAINT fk_fuel_transactions_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Create indexes for faster lookups
CREATE INDEX idx_fuel_transactions_station ON fuel_transactions(station_id);
CREATE INDEX idx_fuel_transactions_vehicle ON fuel_transactions(vehicle_id);
CREATE INDEX idx_fuel_transactions_date ON fuel_transactions(transaction_date);
CREATE INDEX idx_fuel_transactions_fuel_type ON fuel_transactions(fuel_type);

-- =============================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================

-- Create triggers for all tables with updated_at column
CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_vehicle_owners_modtime
    BEFORE UPDATE ON vehicle_owners
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_vehicles_modtime
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_vehicle_classes_modtime
    BEFORE UPDATE ON vehicle_classes
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_fuel_quotas_modtime
    BEFORE UPDATE ON fuel_quotas
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_qr_codes_modtime
    BEFORE UPDATE ON qr_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_station_owners_modtime
    BEFORE UPDATE ON station_owners
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_provinces_modtime
    BEFORE UPDATE ON provinces
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_districts_modtime
    BEFORE UPDATE ON districts
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_fuel_stations_modtime
    BEFORE UPDATE ON fuel_stations
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_station_fuel_types_modtime
    BEFORE UPDATE ON station_fuel_types
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_fuel_inventory_modtime
    BEFORE UPDATE ON fuel_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_departments_modtime
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_admin_users_modtime
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_admin_permissions_modtime
    BEFORE UPDATE ON admin_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_admin_user_permissions_modtime
    BEFORE UPDATE ON admin_user_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_system_settings_modtime
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_refresh_tokens_modtime
    BEFORE UPDATE ON refresh_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_dmt_vehicle_records_modtime
    BEFORE UPDATE ON dmt_vehicle_records
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_vehicle_verification_requests_modtime
    BEFORE UPDATE ON vehicle_verification_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_station_operators_modtime
    BEFORE UPDATE ON station_operators
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- =============================================
-- DEPARTMENT OF MOTOR TRAFFIC INTEGRATION
-- =============================================

-- Create dmt_vehicle_records table to simulate the Department of Motor Traffic database
CREATE TABLE dmt_vehicle_records (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(10) NOT NULL UNIQUE,
    engine_number VARCHAR(50) NOT NULL,
    chassis_number VARCHAR(50) NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year_of_manufacture INTEGER NOT NULL,
    vehicle_class_code VARCHAR(5) NOT NULL,
    owner_nic VARCHAR(12) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    date_of_registration DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups in DMT records
CREATE INDEX idx_dmt_vehicle_records_registration ON dmt_vehicle_records(registration_number);
CREATE INDEX idx_dmt_vehicle_records_engine ON dmt_vehicle_records(engine_number);
CREATE INDEX idx_dmt_vehicle_records_chassis ON dmt_vehicle_records(chassis_number);
CREATE INDEX idx_dmt_vehicle_records_owner_nic ON dmt_vehicle_records(owner_nic);

-- Create vehicle_verification_requests table to track verification status
CREATE TABLE vehicle_verification_requests (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    status verification_status NOT NULL DEFAULT 'PENDING',
    verification_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_verification_requests_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Create index for faster verification lookups
CREATE INDEX idx_vehicle_verification_requests_vehicle ON vehicle_verification_requests(vehicle_id);
CREATE INDEX idx_vehicle_verification_requests_status ON vehicle_verification_requests(status);

-- =============================================
-- STATION OPERATORS
-- =============================================

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

-- Create indexes for faster lookups
CREATE INDEX idx_station_operators_station ON station_operators(station_id);
CREATE INDEX idx_station_operators_employee_id ON station_operators(employee_id);

-- =============================================
-- SMS NOTIFICATION SYSTEM
-- =============================================

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

-- Create index for faster SMS notification lookups
CREATE INDEX idx_sms_notifications_user ON sms_notifications(user_id);
CREATE INDEX idx_sms_notifications_status ON sms_notifications(status);
CREATE INDEX idx_sms_notifications_sent_at ON sms_notifications(sent_at);

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON DATABASE "database.quota.app" IS 'Consolidated database for the quota.app fuel management system';

COMMENT ON TABLE users IS 'Central users table for all user types (vehicle owners, station owners, admins)';
COMMENT ON TABLE vehicle_owners IS 'Information about vehicle owners';
COMMENT ON TABLE vehicles IS 'Information about registered vehicles';
COMMENT ON TABLE vehicle_classes IS 'Predefined vehicle classes as per government regulations';
COMMENT ON TABLE fuel_quotas IS 'Fuel quota allocations for vehicles';
COMMENT ON TABLE qr_codes IS 'QR codes associated with vehicles for identification';
COMMENT ON TABLE vehicle_notifications IS 'Notifications for vehicle owners';

COMMENT ON TABLE station_owners IS 'Information about fuel station owners';
COMMENT ON TABLE provinces IS 'Provinces in Sri Lanka';
COMMENT ON TABLE districts IS 'Districts in Sri Lanka, organized by province';
COMMENT ON TABLE fuel_stations IS 'Information about fuel stations';
COMMENT ON TABLE station_fuel_types IS 'Types of fuel available at each station';
COMMENT ON TABLE fuel_inventory IS 'Fuel inventory levels at stations';
COMMENT ON TABLE station_notifications IS 'Notifications for station owners';

COMMENT ON TABLE departments IS 'Administrative departments';
COMMENT ON TABLE admin_users IS 'Information about administrative users';
COMMENT ON TABLE admin_permissions IS 'Available permissions for admin users';
COMMENT ON TABLE admin_user_permissions IS 'Permissions assigned to admin users';
COMMENT ON TABLE admin_activity_logs IS 'Logs of admin user activities';
COMMENT ON TABLE admin_notifications IS 'Notifications for admin users';
COMMENT ON TABLE system_settings IS 'System-wide configuration settings';

COMMENT ON TABLE fuel_transactions IS 'Record of fuel transactions between vehicles and stations';
COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for authentication';

COMMENT ON TABLE dmt_vehicle_records IS 'Mock database for Department of Motor Traffic vehicle records';
COMMENT ON TABLE vehicle_verification_requests IS 'Requests for verification of vehicle details against DMT records';
COMMENT ON TABLE station_operators IS 'Operators who work at fuel stations and use the mobile app';
COMMENT ON TABLE sms_notifications IS 'SMS notifications sent via Twilio to users';