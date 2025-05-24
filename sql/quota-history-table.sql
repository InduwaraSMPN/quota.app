-- Create quota_history table to track changes to vehicle class quotas
CREATE TABLE quota_history (
    id SERIAL PRIMARY KEY,
    vehicle_class_id INTEGER NOT NULL,
    old_quota_amount DECIMAL(10, 2) NOT NULL,
    new_quota_amount DECIMAL(10, 2) NOT NULL,
    changed_by VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    CONSTRAINT fk_quota_history_vehicle_class FOREIGN KEY (vehicle_class_id) REFERENCES vehicle_classes(id) ON DELETE CASCADE
);

-- Create index for better query performance
CREATE INDEX idx_quota_history_vehicle_class_id ON quota_history(vehicle_class_id);
CREATE INDEX idx_quota_history_changed_at ON quota_history(changed_at);
CREATE INDEX idx_quota_history_changed_by ON quota_history(changed_by);

-- Add some sample quota history data (optional)
-- This would typically be populated by the application when quotas are updated
INSERT INTO quota_history (vehicle_class_id, old_quota_amount, new_quota_amount, changed_by, changed_at, reason) VALUES
(1, 12.00, 14.00, 'admin@quota.app', CURRENT_TIMESTAMP - INTERVAL '7 days', 'Increased quota due to fuel price reduction'),
(2, 12.00, 14.00, 'admin@quota.app', CURRENT_TIMESTAMP - INTERVAL '7 days', 'Increased quota due to fuel price reduction'),
(3, 12.00, 14.00, 'admin@quota.app', CURRENT_TIMESTAMP - INTERVAL '7 days', 'Increased quota due to fuel price reduction'),
(4, 35.00, 40.00, 'admin@quota.app', CURRENT_TIMESTAMP - INTERVAL '5 days', 'Adjusted quota for commercial vehicles'),
(5, 120.00, 125.00, 'admin@quota.app', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Increased quota for heavy vehicles'),
(6, 120.00, 125.00, 'admin@quota.app', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Increased quota for heavy vehicles'),
(7, 120.00, 125.00, 'admin@quota.app', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Increased quota for heavy vehicles'),
(8, 120.00, 125.00, 'admin@quota.app', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Increased quota for heavy vehicles'),
(9, 120.00, 125.00, 'admin@quota.app', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Increased quota for heavy vehicles'),
(10, 120.00, 125.00, 'admin@quota.app', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Increased quota for heavy vehicles'),
(11, 14.00, 16.00, 'admin@quota.app', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Special adjustment for three-wheelers'),
(12, 14.00, 16.00, 'admin@quota.app', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Special adjustment for three-wheelers');