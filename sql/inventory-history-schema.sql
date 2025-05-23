-- Create fuel_inventory_history table to track changes to fuel inventory
CREATE TABLE IF NOT EXISTS fuel_inventory_history (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER NOT NULL,
    previous_stock DECIMAL(10, 2) NOT NULL,
    new_stock DECIMAL(10, 2) NOT NULL,
    change_amount DECIMAL(10, 2) NOT NULL,
    change_type VARCHAR(20), -- REFILL, ADJUSTMENT, CORRECTION
    notes TEXT,
    changed_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_history_inventory FOREIGN KEY (inventory_id) REFERENCES fuel_inventory(id) ON DELETE CASCADE,
    CONSTRAINT fk_inventory_history_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_inventory_history_inventory_id ON fuel_inventory_history(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_created_at ON fuel_inventory_history(created_at);
