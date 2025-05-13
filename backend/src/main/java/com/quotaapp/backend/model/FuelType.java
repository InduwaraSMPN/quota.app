package com.quotaapp.backend.model;

public enum FuelType {
    OCTANE_92("92 OCTANE PETROL"),
    OCTANE_95("95 OCTANE PETROL"),
    AUTO_DIESEL("AUTO DIESEL"),
    SUPER_DIESEL("SUPER DIESEL"),
    KEROSENE("KEROSENE");

    private final String displayName;

    FuelType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
