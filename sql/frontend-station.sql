-- Create database schema for quota.app fuel station registration system

-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('VEHICLE_OWNER', 'STATION_OWNER', 'ADMIN');
CREATE TYPE fuel_type AS ENUM ('92 OCTANE PETROL', '95 OCTANE PETROL', 'AUTO DIESEL', 'SUPER DIESEL', 'KEROSENE');

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
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
    CONSTRAINT fk_province FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE CASCADE,
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
    CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES station_owners(id) ON DELETE CASCADE,
    CONSTRAINT fk_province FOREIGN KEY (province_id) REFERENCES provinces(id),
    CONSTRAINT fk_district FOREIGN KEY (district_id) REFERENCES districts(id),
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
    CONSTRAINT fk_station FOREIGN KEY (station_id) REFERENCES fuel_stations(id) ON DELETE CASCADE,
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
    CONSTRAINT fk_station FOREIGN KEY (station_id) REFERENCES fuel_stations(id) ON DELETE CASCADE,
    CONSTRAINT uq_station_fuel_inventory UNIQUE (station_id, fuel_type)
);

-- Create index for faster lookups
CREATE INDEX idx_fuel_inventory_station ON fuel_inventory(station_id);
CREATE INDEX idx_fuel_inventory_fuel_type ON fuel_inventory(fuel_type);
CREATE INDEX idx_fuel_inventory_refill ON fuel_inventory(next_refill_date);

-- Create fuel_transactions table to track fuel sales
CREATE TABLE fuel_transactions (
    id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL, -- References vehicles table from vehicle frontend
    fuel_type fuel_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_station FOREIGN KEY (station_id) REFERENCES fuel_stations(id) ON DELETE CASCADE
    -- CONSTRAINT fk_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) -- Uncomment when vehicles table is created
);

-- Create indexes for faster lookups
CREATE INDEX idx_fuel_transactions_station ON fuel_transactions(station_id);
CREATE INDEX idx_fuel_transactions_vehicle ON fuel_transactions(vehicle_id);
CREATE INDEX idx_fuel_transactions_date ON fuel_transactions(transaction_date);
CREATE INDEX idx_fuel_transactions_fuel_type ON fuel_transactions(fuel_type);

-- Create station_notifications table for station-specific notifications
CREATE TABLE station_notifications (
    id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_station FOREIGN KEY (station_id) REFERENCES fuel_stations(id) ON DELETE CASCADE
);

-- Create index for faster notification lookups
CREATE INDEX idx_station_notifications_station ON station_notifications(station_id);
CREATE INDEX idx_station_notifications_unread ON station_notifications(station_id, is_read) WHERE is_read = FALSE;

-- Create functions and triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at column
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