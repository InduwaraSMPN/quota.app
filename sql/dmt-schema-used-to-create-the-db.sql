-- Department of Motor Traffic (DMT) Database Schema
-- This is a separate database that simulates the Department of Motor Traffic's vehicle registration system
-- It will be used for validating vehicle registration details during the registration process

-- =============================================
-- VEHICLE CLASSES REFERENCE
-- =============================================

-- Create vehicle_classes table to match the classes in the main database
CREATE TABLE vehicle_classes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(5) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert predefined vehicle classes to match the main database
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

-- =============================================
-- VEHICLE RECORDS
-- =============================================

-- Create vehicle_records table to store official vehicle registration data
CREATE TABLE vehicle_records (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(10) NOT NULL UNIQUE,
    engine_number VARCHAR(50) NOT NULL,
    chassis_number VARCHAR(50) NOT NULL UNIQUE,
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_class_code FOREIGN KEY (vehicle_class_code) REFERENCES vehicle_classes(code),
    CONSTRAINT valid_year_of_manufacture CHECK (year_of_manufacture BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE)),
    CONSTRAINT positive_engine_capacity CHECK (engine_capacity > 0),
    CONSTRAINT positive_gross_vehicle_weight CHECK (gross_vehicle_weight > 0),
    CONSTRAINT valid_date_of_registration CHECK (date_of_registration <= CURRENT_DATE)
);

-- Create indexes for faster verification lookups
CREATE INDEX idx_vehicle_records_registration ON vehicle_records(registration_number);
CREATE INDEX idx_vehicle_records_engine ON vehicle_records(engine_number);
CREATE INDEX idx_vehicle_records_chassis ON vehicle_records(chassis_number);
CREATE INDEX idx_vehicle_records_owner_nic ON vehicle_records(owner_nic);
CREATE INDEX idx_vehicle_records_vehicle_class ON vehicle_records(vehicle_class_code);

-- =============================================
-- API INTEGRATION
-- =============================================

-- Create verification_requests table to log all verification attempts
CREATE TABLE verification_requests (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(10) NOT NULL,
    engine_number VARCHAR(50),
    chassis_number VARCHAR(50),
    owner_nic VARCHAR(12),
    request_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    response_status VARCHAR(20) NOT NULL,
    response_message TEXT,
    client_ip VARCHAR(45),
    client_id VARCHAR(50) NOT NULL
);

-- Create index for verification requests
CREATE INDEX idx_verification_requests_registration ON verification_requests(registration_number);
CREATE INDEX idx_verification_requests_timestamp ON verification_requests(request_timestamp);
CREATE INDEX idx_verification_requests_client ON verification_requests(client_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Create function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vehicle_records
CREATE TRIGGER update_vehicle_records_modtime
    BEFORE UPDATE ON vehicle_records
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Create trigger for vehicle_classes
CREATE TRIGGER update_vehicle_classes_modtime
    BEFORE UPDATE ON vehicle_classes
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- =============================================
-- VERIFICATION FUNCTION
-- =============================================

-- Create function to verify vehicle details
CREATE OR REPLACE FUNCTION verify_vehicle(
    p_registration_number VARCHAR(10),
    p_engine_number VARCHAR(50),
    p_chassis_number VARCHAR(50),
    p_owner_nic VARCHAR(12),
    p_client_id VARCHAR(50),
    p_client_ip VARCHAR(45)
)
RETURNS TABLE (
    is_verified BOOLEAN,
    message TEXT,
    vehicle_class_code VARCHAR(5),
    make VARCHAR(50),
    model VARCHAR(50),
    owner_name VARCHAR(100)
) AS $$
DECLARE
    v_record_exists BOOLEAN;
    v_response_status VARCHAR(20);
    v_response_message TEXT;
BEGIN
    -- Check if vehicle exists with the provided details
    SELECT EXISTS (
        SELECT 1 FROM vehicle_records
        WHERE registration_number = p_registration_number
        AND (
            (p_engine_number IS NULL OR engine_number = p_engine_number)
            AND (p_chassis_number IS NULL OR chassis_number = p_chassis_number)
            AND (p_owner_nic IS NULL OR owner_nic = p_owner_nic)
        )
    ) INTO v_record_exists;
    
    -- Set response based on verification result
    IF v_record_exists THEN
        v_response_status := 'VERIFIED';
        v_response_message := 'Vehicle details verified successfully';
    ELSE
        v_response_status := 'REJECTED';
        v_response_message := 'Vehicle details could not be verified';
    END IF;
    
    -- Log the verification request
    INSERT INTO verification_requests (
        registration_number,
        engine_number,
        chassis_number,
        owner_nic,
        response_status,
        response_message,
        client_ip,
        client_id
    ) VALUES (
        p_registration_number,
        p_engine_number,
        p_chassis_number,
        p_owner_nic,
        v_response_status,
        v_response_message,
        p_client_ip,
        p_client_id
    );
    
    -- Return the verification result
    RETURN QUERY
    SELECT 
        v_record_exists AS is_verified,
        v_response_message AS message,
        vr.vehicle_class_code,
        vr.make,
        vr.model,
        vr.owner_name
    FROM vehicle_records vr
    WHERE vr.registration_number = p_registration_number
    LIMIT 1;
    
    -- If no record found, return a row with NULL values
    IF NOT FOUND THEN
        is_verified := FALSE;
        message := v_response_message;
        vehicle_class_code := NULL;
        make := NULL;
        model := NULL;
        owner_name := NULL;
        RETURN NEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert sample vehicle records for testing (covering all vehicle classes)
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
    -- A1 class (Light motor cycles ≤100cc)
    ('ABC1234', 'ENG123456', 'CHS123456', 'Honda', 'Dio', 2020, 'A1', 'Scooter', 90, 100, '981234567V', 'John Doe', '123 Main St, Colombo', '2020-05-15'),
    
    -- A class (Motorcycles >100cc)
    ('XYZ9876', 'ENG987654', 'CHS987654', 'Yamaha', 'FZ', 2019, 'A', 'Motorcycle', 150, 150, '977654321V', 'Jane Smith', '456 Park Ave, Kandy', '2019-08-22'),
    
    -- B1 class (Motor Tricycle or van)
    ('DEF5678', 'ENG567890', 'CHS567890', 'Bajaj', 'RE', 2018, 'B1', 'Three-wheeler', 200, 500, '965678901V', 'Sam Wilson', '789 Lake Rd, Galle', '2018-03-10'),
    
    -- B class (Dual purpose Motor vehicle)
    ('GHI9012', 'ENG901234', 'CHS901234', 'Toyota', 'Corolla', 2017, 'B', 'Sedan', 1600, 1400, '953456789V', 'Mary Johnson', '234 Hill St, Jaffna', '2017-11-05'),
    
    -- C1 class (Light Motor Lorry)
    ('JKL3456', 'ENG345678', 'CHS345678', 'Isuzu', 'ELF', 2016, 'C1', 'Light Lorry', 4000, 15000, '947890123V', 'David Brown', '567 Beach Rd, Negombo', '2016-07-18'),
    
    -- C class (Motor Lorry)
    ('MNO7890', 'ENG789012', 'CHS789012', 'Tata', 'LPT', 2015, 'C', 'Lorry', 6000, 20000, '992345678V', 'Sarah Lee', '890 Mountain Ave, Nuwara Eliya', '2015-01-30'),
    
    -- CE class (Heavy Motor Lorry combination)
    ('PQR1234', 'ENG123789', 'CHS123789', 'Volvo', 'FH16', 2014, 'CE', 'Heavy Lorry', 12000, 40000, '985678901V', 'Michael Wong', '123 River St, Batticaloa', '2014-09-12'),
    
    -- D1 class (Light Motor Coach)
    ('STU5678', 'ENG567123', 'CHS567123', 'Mitsubishi', 'Rosa', 2013, 'D1', 'Minibus', 4000, 5000, '937890123V', 'Robert Taylor', '456 Forest Rd, Anuradhapura', '2013-04-25'),
    
    -- D class (Motor Coach)
    ('VWX9012', 'ENG901567', 'CHS901567', 'Ashok Leyland', 'Viking', 2012, 'D', 'Bus', 8000, 15000, '925678901V', 'William Davis', '789 Valley Ave, Ratnapura', '2012-12-08'),
    
    -- DE class (Heavy Motor Coach combination)
    ('YZA3456', 'ENG345901', 'CHS345901', 'Scania', 'Irizar', 2011, 'DE', 'Luxury Coach', 12000, 20000, '983456789V', 'Elizabeth Chen', '234 Ocean Blvd, Hambantota', '2011-06-20'),
    
    -- G1 class (Hand Tractors)
    ('BCD7890', 'ENG789345', 'CHS789345', 'Kubota', 'RT140', 2019, 'G1', 'Hand Tractor', 500, 800, '975678123V', 'Thomas Wilson', '567 Farm Rd, Polonnaruwa', '2019-03-15'),
    
    -- G class (Land Vehicle - Agricultural Tractors)
    ('EFG1234', 'ENG234567', 'CHS234567', 'Mahindra', '575', 2018, 'G', 'Tractor', 3000, 3500, '963456789V', 'Patricia Moore', '890 Paddy Field Rd, Ampara', '2018-07-22'),
    
    -- J class (Special purpose Vehicle)
    ('HIJ5678', 'ENG567234', 'CHS567234', 'JCB', '3DX', 2017, 'J', 'Backhoe Loader', 4000, 8000, '951234567V', 'Richard Martin', '123 Construction Site, Matara', '2017-10-05');

-- =============================================
-- API USER AND PERMISSIONS
-- =============================================

-- Create API user for the quota.app system to connect to the DMT database
CREATE USER dmt_api_user WITH PASSWORD 'dmt_secure_password';

-- Grant permissions to the API user
GRANT SELECT ON vehicle_records TO dmt_api_user;
GRANT SELECT ON vehicle_classes TO dmt_api_user;
GRANT SELECT, INSERT ON verification_requests TO dmt_api_user;
GRANT EXECUTE ON FUNCTION verify_vehicle TO dmt_api_user;

-- Create a read-only role for reporting
CREATE ROLE dmt_reporting_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO dmt_reporting_role;

-- Create a reporting user
CREATE USER dmt_reporting_user WITH PASSWORD 'dmt_reporting_password';
GRANT dmt_reporting_role TO dmt_reporting_user;