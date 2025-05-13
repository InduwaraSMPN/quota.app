package com.quotaapp.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quotaapp.backend.dto.ApiResponse;
import com.quotaapp.backend.dto.signup.DMTValidationDTO;
import com.quotaapp.backend.model.dmt.DMTVehicleRecord;
import com.quotaapp.backend.service.DMTValidationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/dmt")
@RequiredArgsConstructor
@Slf4j
public class DMTController {

    private final DMTValidationService dmtValidationService;

    /**
     * Validate vehicle information against DMT database
     *
     * @param validationDTO the validation data
     * @return the response
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateVehicle(@Valid @RequestBody DMTValidationDTO validationDTO) {
        log.info("Validating vehicle: {}", validationDTO.getRegistrationNumber());

        List<String> validationErrors = dmtValidationService.validateVehicleInformation(validationDTO);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("valid", validationErrors.isEmpty());

        if (!validationErrors.isEmpty()) {
            responseData.put("errors", validationErrors);
            return ResponseEntity.ok(ApiResponse.success("Vehicle validation failed", responseData));
        }

        // Get vehicle details from DMT
        Optional<DMTVehicleRecord> vehicleRecord = dmtValidationService.getVehicleDetails(validationDTO.getRegistrationNumber());

        if (vehicleRecord.isPresent()) {
            DMTVehicleRecord record = vehicleRecord.get();
            Map<String, Object> vehicleDetails = new HashMap<>();
            vehicleDetails.put("make", record.getMake());
            vehicleDetails.put("model", record.getModel());
            vehicleDetails.put("yearOfManufacture", record.getYearOfManufacture());
            vehicleDetails.put("vehicleClass", record.getVehicleClassCode());
            vehicleDetails.put("typeOfBody", record.getTypeOfBody());
            vehicleDetails.put("engineCapacity", record.getEngineCapacity());
            vehicleDetails.put("grossVehicleWeight", record.getGrossVehicleWeight());
            vehicleDetails.put("dateOfRegistration", record.getDateOfRegistration());

            responseData.put("vehicleDetails", vehicleDetails);
        }

        return ResponseEntity.ok(ApiResponse.success("Vehicle validation successful", responseData));
    }
}
