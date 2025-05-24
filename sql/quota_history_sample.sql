-- Insert sample quota history data
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
