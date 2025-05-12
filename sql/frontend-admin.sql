-- Create database schema for quota.app admin registration system

-- Create enum types for better data integrity (if not already created)
CREATE TYPE user_role AS ENUM ('VEHICLE_OWNER', 'STATION_OWNER', 'ADMIN');

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
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES departments(id)
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
    CONSTRAINT fk_admin_user FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_permission FOREIGN KEY (permission_id) REFERENCES admin_permissions(id) ON DELETE CASCADE,
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
    CONSTRAINT fk_admin FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
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
    CONSTRAINT fk_admin FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
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

-- Create functions and triggers for updated_at timestamps
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