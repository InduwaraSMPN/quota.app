package com.quotaapp.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.quotaapp.backend.dto.signup.DMTValidationDTO;
import com.quotaapp.backend.model.dmt.DMTVehicleRecord;
import com.quotaapp.backend.repository.dmt.DMTVehicleRecordRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DMTValidationService {

    private final DMTVehicleRecordRepository dmtVehicleRecordRepository;

    /**
     * Validate vehicle information against the DMT database
     * 
     * @param validationDTO the validation data
     * @return a list of validation errors, empty if validation is successful
     */
    @Transactional(readOnly = true, transactionManager = "dmtTransactionManager")
    public List<String> validateVehicleInformation(DMTValidationDTO validationDTO) {
        List<String> validationErrors = new ArrayList<>();
        
        // Standardize registration number (remove hyphens)
        String registrationNumber = validationDTO.getRegistrationNumber().replaceAll("-", "").toUpperCase();
        
        // Find the vehicle record by registration number
        Optional<DMTVehicleRecord> vehicleRecordOpt = dmtVehicleRecordRepository.findByRegistrationNumber(registrationNumber);
        
        if (vehicleRecordOpt.isEmpty()) {
            validationErrors.add("Vehicle with registration number " + validationDTO.getRegistrationNumber() + " not found in DMT records");
            return validationErrors;
        }
        
        DMTVehicleRecord vehicleRecord = vehicleRecordOpt.get();
        
        // Validate chassis number
        if (!vehicleRecord.getChassisNumber().equalsIgnoreCase(validationDTO.getChassisNumber())) {
            validationErrors.add("Chassis number does not match DMT records");
        }
        
        // Validate engine number
        if (!vehicleRecord.getEngineNumber().equalsIgnoreCase(validationDTO.getEngineNumber())) {
            validationErrors.add("Engine number does not match DMT records");
        }
        
        // Validate owner NIC
        if (!vehicleRecord.getOwnerNic().equalsIgnoreCase(validationDTO.getOwnerNIC())) {
            validationErrors.add("Owner NIC does not match DMT records");
        }
        
        // Validate owner name (partial match is acceptable)
        String ownerNameFromDMT = vehicleRecord.getOwnerName().toLowerCase();
        String ownerNameFromRequest = validationDTO.getOwnerName().toLowerCase();
        
        if (!ownerNameFromDMT.contains(ownerNameFromRequest) && !ownerNameFromRequest.contains(ownerNameFromDMT)) {
            validationErrors.add("Owner name does not match DMT records");
        }
        
        log.info("DMT validation for vehicle {}: {}", registrationNumber, validationErrors.isEmpty() ? "SUCCESS" : "FAILED");
        return validationErrors;
    }
    
    /**
     * Get vehicle details from DMT database
     * 
     * @param registrationNumber the vehicle registration number
     * @return the vehicle record if found
     */
    @Transactional(readOnly = true, transactionManager = "dmtTransactionManager")
    public Optional<DMTVehicleRecord> getVehicleDetails(String registrationNumber) {
        // Standardize registration number (remove hyphens)
        String standardizedRegNumber = registrationNumber.replaceAll("-", "").toUpperCase();
        return dmtVehicleRecordRepository.findByRegistrationNumber(standardizedRegNumber);
    }
}
