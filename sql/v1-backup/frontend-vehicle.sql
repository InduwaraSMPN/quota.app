-- Create database schema for quota.app vehicle registration system

-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('VEHICLE_OWNER', 'STATION_OWNER', 'ADMIN');
CREATE TYPE fuel_type AS ENUM ('92 OCTANE PETROL', '95 OCTANE PETROL', 'AUTO DIESEL', 'SUPER DIESEL', 'KEROSENE');

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

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'VEHICLE_OWNER',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster login queries
CREATE INDEX idx_users_email ON users(email);

-- Create owners table
CREATE TABLE owners (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    nic_number VARCHAR(12) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for faster lookups
CREATE INDEX idx_owners_nic ON owners(nic_number);
CREATE INDEX idx_owners_contact ON owners(contact_number);

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
    CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE,
    CONSTRAINT fk_vehicle_class FOREIGN KEY (vehicle_class_id) REFERENCES vehicle_classes(id)
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
    CONSTRAINT fk_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
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
    CONSTRAINT fk_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Create index for faster QR code lookups
CREATE INDEX idx_qr_codes_vehicle ON qr_codes(vehicle_id);

-- Create fuel_consumption table to track fuel usage
CREATE TABLE fuel_consumption (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    station_id INTEGER NOT NULL, -- This would reference a station table in a complete schema
    amount DECIMAL(10, 2) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Create indexes for faster consumption lookups
CREATE INDEX idx_fuel_consumption_vehicle ON fuel_consumption(vehicle_id);
CREATE INDEX idx_fuel_consumption_date ON fuel_consumption(transaction_date);

-- Create notifications table for user notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster notification lookups
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Create refresh_tokens table for JWT authentication
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster token lookups
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- Create functions and triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at column
CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_owners_modtime
    BEFORE UPDATE ON owners
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