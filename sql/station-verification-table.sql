-- Add station verification requests table to track verification status

-- First, check if the verification_status type exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
        CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
    END IF;
END
$$;

-- Create station_verification_requests table to track verification status
CREATE TABLE IF NOT EXISTS station_verification_requests (
    id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL,
    status verification_status NOT NULL DEFAULT 'PENDING',
    verification_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_station_verification_requests_station FOREIGN KEY (station_id) REFERENCES fuel_stations(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_station_verification_requests_station ON station_verification_requests(station_id);
CREATE INDEX IF NOT EXISTS idx_station_verification_requests_status ON station_verification_requests(status);

-- Create or replace function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update the updated_at timestamp
DROP TRIGGER IF EXISTS update_station_verification_requests_updated_at ON station_verification_requests;
CREATE TRIGGER update_station_verification_requests_updated_at
BEFORE UPDATE ON station_verification_requests
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Add comment to the table
COMMENT ON TABLE station_verification_requests IS 'Requests for verification of station details';

-- Update the submitSignupForm function in the backend to automatically create a verification request
-- This is a reminder for the backend implementation