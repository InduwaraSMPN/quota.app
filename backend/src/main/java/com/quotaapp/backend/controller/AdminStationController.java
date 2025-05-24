package com.quotaapp.backend.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.dto.station.StationDetailsDTO;
import com.quotaapp.backend.dto.station.StationStatusUpdateDTO;
import com.quotaapp.backend.dto.station.StationUpdateDTO;
import com.quotaapp.backend.exception.ResourceNotFoundException;
import com.quotaapp.backend.model.FuelStation;
import com.quotaapp.backend.model.StationFuelType;
import com.quotaapp.backend.model.StationOwner;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.repository.primary.FuelStationRepository;
import com.quotaapp.backend.repository.primary.StationFuelTypeRepository;
import com.quotaapp.backend.service.NotificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for admin station management
 */
@RestController
@RequestMapping("/api/admin/stations")
@RequiredArgsConstructor
@Slf4j
public class AdminStationController {

    private final FuelStationRepository fuelStationRepository;
    private final StationFuelTypeRepository stationFuelTypeRepository;
    private final NotificationService notificationService;

    /**
     * Get all fuel stations with pagination, sorting, and filtering
     *
     * @param page the page number (0-based)
     * @param size the page size
     * @param sort the sort field
     * @param direction the sort direction
     * @param search the search term for name or location
     * @param status the verification status filter
     * @return a page of fuel stations
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllStations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {

        log.info("Getting all stations with pagination: page={}, size={}, sort={}, direction={}, search={}, status={}",
                page, size, sort, direction, search, status);

        try {
            // Create pageable object for pagination and sorting
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));

            // Get stations with filtering
            Page<FuelStation> stationsPage;

            if (search != null && !search.isEmpty() && status != null && !status.isEmpty()) {
                // Both search and status filter - get all and filter manually for now
                // TODO: Implement combined search and filter repository method
                stationsPage = fuelStationRepository.findAll(pageable);
            } else if (search != null && !search.isEmpty()) {
                // Search by business name or address
                stationsPage = fuelStationRepository.findByBusinessNameContainingIgnoreCaseOrBusinessAddressContainingIgnoreCase(
                        search, search, pageable);
            } else if (status != null && !status.isEmpty()) {
                // Filter by verification status
                stationsPage = fuelStationRepository.findByVerificationStatus(status, pageable);
            } else {
                // Get all stations
                stationsPage = fuelStationRepository.findAll(pageable);
            }

            // Convert stations to DTOs
            List<StationDetailsDTO> stations = stationsPage.getContent().stream()
                    .map(station -> {
                        StationOwner owner = station.getOwner();
                        User user = owner.getUser();

                        // Get fuel types for this station
                        List<StationFuelType> fuelTypes = stationFuelTypeRepository.findByStation(station);

                        return StationDetailsDTO.builder()
                                .id(station.getId())
                                .ownerId(owner.getId())
                                .ownerName(owner.getFullName())
                                .ownerEmail(user.getEmail())
                                .ownerContactNumber(owner.getContactNumber())
                                .businessRegistrationNumber(station.getBusinessRegistrationNumber())
                                .businessName(station.getBusinessName())
                                .businessAddress(station.getBusinessAddress())
                                .verificationStatus(station.getVerificationStatus())
                                .fuelTypes(fuelTypes.stream()
                                        .map(ft -> {
                                            Map<String, Object> fuelTypeMap = new HashMap<>();
                                            fuelTypeMap.put("fuelType", ft.getFuelType().toString());
                                            fuelTypeMap.put("isAvailable", ft.isAvailable());
                                            fuelTypeMap.put("unitPrice", ft.getUnitPrice());
                                            return fuelTypeMap;
                                        })
                                        .collect(Collectors.toList()))
                                .createdAt(station.getCreatedAt())
                                .updatedAt(station.getUpdatedAt())
                                .build();
                    })
                    .collect(Collectors.toList());

            // Create response with pagination information
            Map<String, Object> response = new HashMap<>();
            response.put("stations", stations);
            response.put("currentPage", stationsPage.getNumber());
            response.put("totalItems", stationsPage.getTotalElements());
            response.put("totalPages", stationsPage.getTotalPages());

            return ResponseEntity.ok(ApiResponse.success("Fuel stations retrieved successfully", response));
        } catch (Exception e) {
            log.error("Error getting fuel stations", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Error getting fuel stations: " + e.getMessage()));
        }
    }

    /**
     * Get fuel station details by ID
     *
     * @param id the station ID
     * @return the fuel station details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StationDetailsDTO>> getStationById(@PathVariable Long id) {
        log.info("Getting fuel station with ID: {}", id);

        try {
            // Find station by ID
            FuelStation station = fuelStationRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Fuel station not found with ID: " + id));

            StationOwner owner = station.getOwner();
            User user = owner.getUser();

            // Get fuel types for this station
            List<StationFuelType> fuelTypes = stationFuelTypeRepository.findByStation(station);

            // Create DTO
            StationDetailsDTO stationDetails = StationDetailsDTO.builder()
                    .id(station.getId())
                    .ownerId(owner.getId())
                    .ownerName(owner.getFullName())
                    .ownerEmail(user.getEmail())
                    .ownerContactNumber(owner.getContactNumber())
                    .businessRegistrationNumber(station.getBusinessRegistrationNumber())
                    .businessName(station.getBusinessName())
                    .businessAddress(station.getBusinessAddress())
                    .verificationStatus(station.getVerificationStatus())
                    .fuelTypes(fuelTypes.stream()
                            .map(ft -> {
                                Map<String, Object> fuelTypeMap = new HashMap<>();
                                fuelTypeMap.put("fuelType", ft.getFuelType().toString());
                                fuelTypeMap.put("isAvailable", ft.isAvailable());
                                fuelTypeMap.put("unitPrice", ft.getUnitPrice());
                                return fuelTypeMap;
                            })
                            .collect(Collectors.toList()))
                    .createdAt(station.getCreatedAt())
                    .updatedAt(station.getUpdatedAt())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Fuel station retrieved successfully", stationDetails));
        } catch (ResourceNotFoundException e) {
            log.error("Fuel station not found", e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting fuel station", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Error getting fuel station: " + e.getMessage()));
        }
    }

    /**
     * Update fuel station information
     *
     * @param id the station ID
     * @param stationUpdate the station update data
     * @return the updated fuel station details
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StationDetailsDTO>> updateStation(
            @PathVariable Long id,
            @Valid @RequestBody StationUpdateDTO stationUpdate) {

        log.info("Updating fuel station with ID: {}", id);

        try {
            // Find station by ID
            FuelStation station = fuelStationRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Fuel station not found with ID: " + id));

            // Update station information
            if (stationUpdate.getBusinessName() != null) {
                station.setBusinessName(stationUpdate.getBusinessName());
            }

            if (stationUpdate.getBusinessAddress() != null) {
                station.setBusinessAddress(stationUpdate.getBusinessAddress());
            }

            // Update timestamps
            station.setUpdatedAt(LocalDateTime.now());

            // Save changes
            fuelStationRepository.save(station);

            // Get owner and user for notification
            StationOwner owner = station.getOwner();
            User user = owner.getUser();

            // Create notification for the station
            try {
                notificationService.createStationNotification(
                        station.getId(),
                        "Station Information Updated",
                        "Your station information has been updated by an administrator."
                );
            } catch (Exception e) {
                log.error("Error creating station notification", e);
                // Continue without failing the request
            }

            // Get fuel types for this station
            List<StationFuelType> fuelTypes = stationFuelTypeRepository.findByStation(station);

            // Create DTO for response
            StationDetailsDTO stationDetails = StationDetailsDTO.builder()
                    .id(station.getId())
                    .ownerId(owner.getId())
                    .ownerName(owner.getFullName())
                    .ownerEmail(user.getEmail())
                    .ownerContactNumber(owner.getContactNumber())
                    .businessRegistrationNumber(station.getBusinessRegistrationNumber())
                    .businessName(station.getBusinessName())
                    .businessAddress(station.getBusinessAddress())
                    .verificationStatus(station.getVerificationStatus())
                    .fuelTypes(fuelTypes.stream()
                            .map(ft -> {
                                Map<String, Object> fuelTypeMap = new HashMap<>();
                                fuelTypeMap.put("fuelType", ft.getFuelType().toString());
                                fuelTypeMap.put("isAvailable", ft.isAvailable());
                                fuelTypeMap.put("unitPrice", ft.getUnitPrice());
                                return fuelTypeMap;
                            })
                            .collect(Collectors.toList()))
                    .createdAt(station.getCreatedAt())
                    .updatedAt(station.getUpdatedAt())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Fuel station updated successfully", stationDetails));
        } catch (ResourceNotFoundException e) {
            log.error("Fuel station not found", e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating fuel station", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Error updating fuel station: " + e.getMessage()));
        }
    }

    /**
     * Update fuel station verification status
     *
     * @param id the station ID
     * @param statusUpdate the status update data
     * @return the updated fuel station details
     */
    @PutMapping("/{id}/verification")
    public ResponseEntity<ApiResponse<StationDetailsDTO>> updateStationVerificationStatus(
            @PathVariable Long id,
            @Valid @RequestBody StationStatusUpdateDTO statusUpdate) {

        log.info("Updating fuel station verification status with ID: {}, status: {}", id, statusUpdate.getStatus());

        try {
            // Find station by ID
            FuelStation station = fuelStationRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Fuel station not found with ID: " + id));

            // Update verification status
            station.setVerificationStatus(statusUpdate.getStatus());

            // Note: Rejection reason is handled in the notification message
            // The FuelStation model doesn't have a rejectionReason field

            // Update timestamps
            station.setUpdatedAt(LocalDateTime.now());

            // Save changes
            fuelStationRepository.save(station);

            // Get owner and user for notification
            StationOwner owner = station.getOwner();
            User user = owner.getUser();

            // Create notification for the station owner
            String notificationTitle = "Station Verification Status Updated";
            String notificationMessage = "Your station verification status has been updated to " + statusUpdate.getStatus() + ".";

            if (statusUpdate.getStatus().equals("REJECTED") && statusUpdate.getRejectionReason() != null) {
                notificationMessage += " Reason: " + statusUpdate.getRejectionReason();
            }

            try {
                notificationService.createStationNotification(
                        station.getId(),
                        notificationTitle,
                        notificationMessage
                );
            } catch (Exception e) {
                log.error("Error creating station notification", e);
                // Continue without failing the request
            }

            // Get fuel types for this station
            List<StationFuelType> fuelTypes = stationFuelTypeRepository.findByStation(station);

            // Create DTO for response
            StationDetailsDTO stationDetails = StationDetailsDTO.builder()
                    .id(station.getId())
                    .ownerId(owner.getId())
                    .ownerName(owner.getFullName())
                    .ownerEmail(user.getEmail())
                    .ownerContactNumber(owner.getContactNumber())
                    .businessRegistrationNumber(station.getBusinessRegistrationNumber())
                    .businessName(station.getBusinessName())
                    .businessAddress(station.getBusinessAddress())
                    .verificationStatus(station.getVerificationStatus())
                    .fuelTypes(fuelTypes.stream()
                            .map(ft -> {
                                Map<String, Object> fuelTypeMap = new HashMap<>();
                                fuelTypeMap.put("fuelType", ft.getFuelType().toString());
                                fuelTypeMap.put("isAvailable", ft.isAvailable());
                                fuelTypeMap.put("unitPrice", ft.getUnitPrice());
                                return fuelTypeMap;
                            })
                            .collect(Collectors.toList()))
                    .createdAt(station.getCreatedAt())
                    .updatedAt(station.getUpdatedAt())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Fuel station verification status updated successfully", stationDetails));
        } catch (ResourceNotFoundException e) {
            log.error("Fuel station not found", e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating fuel station verification status", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Error updating fuel station verification status: " + e.getMessage()));
        }
    }
}
