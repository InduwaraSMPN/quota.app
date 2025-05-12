-- Department of Motor Traffic (DMT) Database Schema
-- This is a separate database that simulates the Department of Motor Traffic's vehicle registration system
-- It will be used for validating vehicle registration details during the registration process

-- Create vehicle_records table to store official vehicle registration data
CREATE TABLE vehicle_records (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(10) NOT NULL UNIQUE,
    engine_number VARCHAR(50) NOT NULL,
    chassis_number VARCHAR(50) NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year_of_manufacture INTEGER NOT NULL,
    vehicle_class_code VARCHAR(5) NOT NULL,
    type_of_body VARCHAR(50) NOT NULL,
    engine_capacity INTEGER NOT NULL,
    gross_vehicle_weight INTEGER NOT NULL,
    owner_nic VARCHAR(12) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    owner_address TEXT NOT NULL,
    date_of_registration DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Insert sample vehicle records for testing
INSERT INTO vehicle_records (
    registration_number, 
    engine_number, 
    chassis_number, 
    make, 
    model, 
    year_of_manufacture, 
    vehicle_class_code, 
    type_of_body, 
    engine_capacity, 
    gross_vehicle_weight, 
    owner_nic, 
    owner_name, 
    owner_address, 
    date_of_registration
) VALUES
    ('ABC1234', 'ENG123456', 'CHS123456', 'Toyota', 'Corolla', 2018, 'B', 'Sedan', 1800, 1500, '981234567V', 'John Doe', '123 Main St, Colombo', '2018-05-15'),
    ('XYZ9876', 'ENG987654', 'CHS987654', 'Honda', 'Civic', 2019, 'B', 'Sedan', 1500, 1300, '977654321V', 'Jane Smith', '456 Park Ave, Kandy', '2019-08-22'),
    ('DEF5678', 'ENG567890', 'CHS567890', 'Suzuki', 'Swift', 2020, 'B', 'Hatchback', 1200, 1000, '965678901V', 'Sam Wilson', '789 Lake Rd, Galle', '2020-03-10'),
    ('GHI9012', 'ENG901234', 'CHS901234', 'Nissan', 'Sunny', 2017, 'B', 'Sedan', 1600, 1400, '953456789V', 'Mary Johnson', '234 Hill St, Jaffna', '2017-11-05'),
    ('JKL3456', 'ENG345678', 'CHS345678', 'Mitsubishi', 'Lancer', 2016, 'B', 'Sedan', 1800, 1500, '947890123V', 'David Brown', '567 Beach Rd, Negombo', '2016-07-18'),
    ('MNO7890', 'ENG789012', 'CHS789012', 'Bajaj', 'Pulsar', 2021, 'A', 'Motorcycle', 150, 150, '992345678V', 'Sarah Lee', '890 Mountain Ave, Nuwara Eliya', '2021-01-30'),
    ('PQR1234', 'ENG123789', 'CHS123789', 'Yamaha', 'FZ', 2020, 'A', 'Motorcycle', 150, 150, '985678901V', 'Michael Wong', '123 River St, Batticaloa', '2020-09-12'),
    ('STU5678', 'ENG567123', 'CHS567123', 'Tata', 'Lorry', 2015, 'C', 'Lorry', 5000, 10000, '937890123V', 'Robert Taylor', '456 Forest Rd, Anuradhapura', '2015-04-25'),
    ('VWX9012', 'ENG901567', 'CHS901567', 'Ashok Leyland', 'Bus', 2014, 'D', 'Bus', 8000, 15000, '925678901V', 'William Davis', '789 Valley Ave, Ratnapura', '2014-12-08'),
    ('YZA3456', 'ENG345901', 'CHS345901', 'Mahindra', 'Bolero', 2019, 'B1', 'SUV', 2500, 2000, '983456789V', 'Elizabeth Chen', '234 Ocean Blvd, Hambantota', '2019-06-20');

-- Create API user for the quota.app system to connect to the DMT database
CREATE USER dmt_api_user WITH PASSWORD 'dmt_secure_password';
GRANT SELECT ON vehicle_records TO dmt_api_user;