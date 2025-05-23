package com.quotaapp.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.model.StationOwner;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.repository.primary.StationOwnerRepository;
import com.quotaapp.backend.repository.primary.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller for station owner-specific endpoints
 */
@RestController
@RequestMapping("/api/station-owner")
@RequiredArgsConstructor
@Slf4j
public class StationOwnerController {

    private final UserRepository userRepository;
    private final StationOwnerRepository stationOwnerRepository;

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Get the station owner's profile
     *
     * @return the station owner profile
     */
    @GetMapping("/profile")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStationOwnerProfile() {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Fetching station owner profile for user: {}", email);

        // Find the user in the database
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }

        User user = userOpt.get();

        // Verify that the user is a station owner
        if (!user.getRole().name().equals("STATION_OWNER")) {
            log.warn("User is not a station owner: {}", email);
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Station owner privileges required."));
        }

        // Find the station owner details
        Optional<StationOwner> stationOwnerOpt = stationOwnerRepository.findByUser(user);

        if (stationOwnerOpt.isEmpty()) {
            log.warn("Station owner details not found for user: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("Station owner details not found"));
        }

        StationOwner stationOwner = stationOwnerOpt.get();

        // Create the response data
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("id", user.getId());
        profileData.put("email", user.getEmail());
        profileData.put("username", user.getEmail()); // Using email as username for consistency with frontend
        profileData.put("role", user.getRole().name());
        profileData.put("isActive", user.isActive());
        profileData.put("emailVerified", user.isEmailVerified());
        profileData.put("fullName", stationOwner.getFullName());
        profileData.put("nicNumber", stationOwner.getNicNumber());
        profileData.put("contactNumber", stationOwner.getContactNumber());

        // Find the fuel stations using a query that doesn't fetch related collections
        // to avoid ConcurrentModificationException
        try {
            // Use a native query to get just the basic station information
            @SuppressWarnings("unchecked")
            List<Object[]> stationData = (List<Object[]>) entityManager.createNativeQuery(
                "SELECT fs.id, fs.station_name, fs.business_registration_number, fs.business_address, " +
                "fs.opening_time, fs.closing_time " +
                "FROM fuel_stations fs " +
                "WHERE fs.owner_id = :ownerId")
                .setParameter("ownerId", stationOwner.getId())
                .getResultList();

            // Add station information if available
            if (!stationData.isEmpty()) {
                Object[] station = stationData.get(0); // Get the first station

                // Extract data from the result array
                profileData.put("stationName", station[1]);
                profileData.put("businessRegistrationNumber", station[2]);
                profileData.put("businessAddress", station[3]);

                // Format opening and closing times as operating hours
                String operatingHours = station[4] + " - " + station[5];
                profileData.put("operatingHours", operatingHours);
            }
        } catch (Exception e) {
            log.error("Error fetching station data: {}", e.getMessage(), e);
            // Continue without station data if there's an error
        }

        return ResponseEntity.ok(ApiResponse.success("Station owner profile retrieved successfully", profileData));
    }

    /**
     * Update the station owner's profile
     *
     * @param profileData the profile data to update
     * @return the updated station owner profile
     */
    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateStationOwnerProfile(@Valid @RequestBody Map<String, Object> profileData) {
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("Updating station owner profile for user: {}", email);

        // Find the user in the database
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }

        User user = userOpt.get();

        // Verify that the user is a station owner
        if (!user.getRole().name().equals("STATION_OWNER")) {
            log.warn("User is not a station owner: {}", email);
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied. Station owner privileges required."));
        }

        // Find the station owner details
        Optional<StationOwner> stationOwnerOpt = stationOwnerRepository.findByUser(user);

        if (stationOwnerOpt.isEmpty()) {
            log.warn("Station owner details not found for user: {}", email);
            return ResponseEntity.status(404).body(ApiResponse.error("Station owner details not found"));
        }

        StationOwner stationOwner = stationOwnerOpt.get();

        // Update station owner fields
        if (profileData.containsKey("fullName")) {
            stationOwner.setFullName((String) profileData.get("fullName"));
        }

        if (profileData.containsKey("contactNumber")) {
            stationOwner.setContactNumber((String) profileData.get("contactNumber"));
        }

        // NIC number cannot be changed
        if (profileData.containsKey("nicNumber")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("NIC number cannot be changed"));
        }

        // Save the updated station owner
        stationOwnerRepository.save(stationOwner);

        // Update station information if available
        if (profileData.containsKey("stationName") ||
            profileData.containsKey("businessAddress") ||
            profileData.containsKey("operatingHours")) {

            try {
                // First, get the station ID using a native query
                List<?> stationIds = entityManager.createNativeQuery(
                    "SELECT fs.id FROM fuel_stations fs WHERE fs.owner_id = :ownerId")
                    .setParameter("ownerId", stationOwner.getId())
                    .getResultList();

                if (!stationIds.isEmpty()) {
                    Long stationId = ((Number) stationIds.get(0)).longValue();

                    // Registration number cannot be changed
                    if (profileData.containsKey("businessRegistrationNumber")) {
                        return ResponseEntity.badRequest().body(ApiResponse.error("Business registration number cannot be changed"));
                    }

                    // Update station name if provided
                    if (profileData.containsKey("stationName")) {
                        entityManager.createNativeQuery(
                            "UPDATE fuel_stations SET station_name = :stationName WHERE id = :stationId")
                            .setParameter("stationName", profileData.get("stationName"))
                            .setParameter("stationId", stationId)
                            .executeUpdate();
                    }

                    // Update business address if provided
                    if (profileData.containsKey("businessAddress")) {
                        entityManager.createNativeQuery(
                            "UPDATE fuel_stations SET business_address = :businessAddress WHERE id = :stationId")
                            .setParameter("businessAddress", profileData.get("businessAddress"))
                            .setParameter("stationId", stationId)
                            .executeUpdate();
                    }

                    // Update operating hours if provided
                    if (profileData.containsKey("operatingHours")) {
                        // Parse operating hours string to set opening and closing times
                        String operatingHours = (String) profileData.get("operatingHours");
                        try {
                            // Assuming format like "08:00 - 18:00"
                            String[] times = operatingHours.split(" - ");
                            if (times.length == 2) {
                                LocalTime openingTime = LocalTime.parse(times[0]);
                                LocalTime closingTime = LocalTime.parse(times[1]);

                                // Convert LocalTime to java.sql.Time for proper database type mapping
                                java.sql.Time sqlOpeningTime = java.sql.Time.valueOf(openingTime);
                                java.sql.Time sqlClosingTime = java.sql.Time.valueOf(closingTime);

                                entityManager.createNativeQuery(
                                    "UPDATE fuel_stations SET opening_time = :openingTime, closing_time = :closingTime WHERE id = :stationId")
                                    .setParameter("openingTime", sqlOpeningTime)
                                    .setParameter("closingTime", sqlClosingTime)
                                    .setParameter("stationId", stationId)
                                    .executeUpdate();
                            }
                        } catch (Exception e) {
                            log.warn("Failed to parse operating hours: {}", operatingHours, e);
                            return ResponseEntity.badRequest().body(ApiResponse.error(
                                "Invalid operating hours format. Please use the format 'HH:MM - HH:MM' (e.g., '08:00 - 18:00')."
                            ));
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Error updating station data: {}", e.getMessage(), e);

                // Provide more specific error messages based on the exception type
                if (e instanceof jakarta.persistence.PersistenceException && e.getCause() instanceof org.hibernate.exception.SQLGrammarException) {
                    return ResponseEntity.status(400).body(ApiResponse.error(
                        "Invalid data format. Please check your input values and try again."
                    ));
                } else if (e instanceof jakarta.persistence.TransactionRequiredException) {
                    return ResponseEntity.status(500).body(ApiResponse.error(
                        "Database transaction error. Please try again later."
                    ));
                } else {
                    return ResponseEntity.status(500).body(ApiResponse.error(
                        "Failed to update station information: " + e.getMessage()
                    ));
                }
            }
        }

        // Create the response data with updated information
        Map<String, Object> updatedProfileData = new HashMap<>();
        updatedProfileData.put("id", user.getId());
        updatedProfileData.put("email", user.getEmail());
        updatedProfileData.put("username", user.getEmail());
        updatedProfileData.put("role", user.getRole().name());
        updatedProfileData.put("isActive", user.isActive());
        updatedProfileData.put("emailVerified", user.isEmailVerified());
        updatedProfileData.put("fullName", stationOwner.getFullName());
        updatedProfileData.put("nicNumber", stationOwner.getNicNumber());
        updatedProfileData.put("contactNumber", stationOwner.getContactNumber());

        // Add updated station information if available
        try {
            // Use a native query to get just the basic station information
            @SuppressWarnings("unchecked")
            List<Object[]> stationData = (List<Object[]>) entityManager.createNativeQuery(
                "SELECT fs.id, fs.station_name, fs.business_registration_number, fs.business_address, " +
                "fs.opening_time, fs.closing_time " +
                "FROM fuel_stations fs " +
                "WHERE fs.owner_id = :ownerId")
                .setParameter("ownerId", stationOwner.getId())
                .getResultList();

            if (!stationData.isEmpty()) {
                Object[] station = (Object[]) stationData.get(0); // Get the first station

                // Extract data from the result array
                updatedProfileData.put("stationName", station[1]);
                updatedProfileData.put("businessRegistrationNumber", station[2]);
                updatedProfileData.put("businessAddress", station[3]);

                // Format opening and closing times as operating hours
                String operatingHours = station[4] + " - " + station[5];
                updatedProfileData.put("operatingHours", operatingHours);
            }
        } catch (Exception e) {
            log.error("Error fetching updated station data: {}", e.getMessage(), e);
            // Continue without station data if there's an error
        }

        return ResponseEntity.ok(ApiResponse.success("Station owner profile updated successfully", updatedProfileData));
    }
}
