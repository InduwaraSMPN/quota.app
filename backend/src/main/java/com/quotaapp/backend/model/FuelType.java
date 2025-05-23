package com.quotaapp.backend.model;

import java.util.Arrays;

public enum FuelType {
    PETROL_92("92 OCTANE PETROL"),
    PETROL_95("95 OCTANE PETROL"),
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

    /**
     * Find a FuelType enum by its display name
     *
     * @param displayName the display name to search for
     * @return the matching FuelType enum, or null if not found
     */
    public static FuelType fromDisplayName(String displayName) {
        if (displayName == null) {
            return null;
        }

        return Arrays.stream(FuelType.values())
                .filter(fuelType -> fuelType.getDisplayName().equalsIgnoreCase(displayName))
                .findFirst()
                .orElse(null);
    }
}
