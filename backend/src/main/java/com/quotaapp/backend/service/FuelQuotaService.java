package com.quotaapp.backend.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.quotaapp.backend.dto.quota.QuotaAllocationDTO;
import com.quotaapp.backend.dto.quota.QuotaDetailsDTO;
import com.quotaapp.backend.exception.InsufficientQuotaException;
import com.quotaapp.backend.exception.ResourceNotFoundException;
import com.quotaapp.backend.model.FuelQuota;
import com.quotaapp.backend.model.Vehicle;
import com.quotaapp.backend.repository.primary.FuelQuotaRepository;
import com.quotaapp.backend.repository.primary.VehicleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for managing fuel quotas
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FuelQuotaService {

    private final FuelQuotaRepository fuelQuotaRepository;
    private final VehicleRepository vehicleRepository;
    
    /**
     * Get all quotas for a vehicle
     * 
     * @param vehicleId the vehicle ID
     * @return a list of fuel quotas
     */
    public List<FuelQuota> getQuotasByVehicleId(Long vehicleId) {
        log.info("Getting all quotas for vehicle ID: {}", vehicleId);
        return fuelQuotaRepository.findByVehicleId(vehicleId);
    }
    
    /**
     * Get the current active quota for a vehicle
     * 
     * @param vehicleId the vehicle ID
     * @return the active fuel quota
     * @throws ResourceNotFoundException if no active quota is found
     */
    public FuelQuota getCurrentQuotaByVehicleId(Long vehicleId) {
        log.info("Getting current quota for vehicle ID: {}", vehicleId);
        return fuelQuotaRepository.findCurrentQuotaByVehicleId(vehicleId, LocalDate.now())
                .orElseThrow(() -> new ResourceNotFoundException("No active quota found for vehicle ID: " + vehicleId));
    }
    
    /**
     * Get quota details for a vehicle
     * 
     * @param vehicleId the vehicle ID
     * @return the quota details
     */
    public QuotaDetailsDTO getQuotaDetails(Long vehicleId) {
        log.info("Getting quota details for vehicle ID: {}", vehicleId);
        
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId));
        
        // Get the current quota if available
        Optional<FuelQuota> currentQuotaOpt = fuelQuotaRepository.findCurrentQuotaByVehicleId(vehicleId, LocalDate.now());
        
        QuotaDetailsDTO quotaDetails = new QuotaDetailsDTO();
        quotaDetails.setVehicleId(vehicleId);
        quotaDetails.setRegistrationNumber(vehicle.getRegistrationNumber());
        quotaDetails.setVehicleClass(vehicle.getVehicleClass().getCode());
        quotaDetails.setFuelType(vehicle.getFuelType());
        
        // Set quota information if available
        if (currentQuotaOpt.isPresent()) {
            FuelQuota currentQuota = currentQuotaOpt.get();
            quotaDetails.setAllocatedAmount(currentQuota.getAllocatedAmount());
            quotaDetails.setRemainingAmount(currentQuota.getRemainingAmount());
            quotaDetails.setAllocationDate(currentQuota.getAllocationDate());
            quotaDetails.setExpiryDate(currentQuota.getExpiryDate());
            quotaDetails.setQuotaStatus("ACTIVE");
        } else {
            // Set default values if no active quota
            quotaDetails.setAllocatedAmount(BigDecimal.ZERO);
            quotaDetails.setRemainingAmount(BigDecimal.ZERO);
            quotaDetails.setAllocationDate(null);
            quotaDetails.setExpiryDate(null);
            quotaDetails.setQuotaStatus("INACTIVE");
        }
        
        // Get the next quota allocation date (30 days from now by default)
        LocalDate nextAllocationDate = LocalDate.now().plusDays(30);
        
        // Check if there's a future quota already allocated
        List<FuelQuota> futureQuotas = fuelQuotaRepository.findFutureQuotasByVehicle(vehicle, LocalDate.now());
        if (!futureQuotas.isEmpty()) {
            nextAllocationDate = futureQuotas.get(0).getAllocationDate();
        }
        
        quotaDetails.setNextAllocationDate(nextAllocationDate);
        
        return quotaDetails;
    }
    
    /**
     * Allocate a new quota for a vehicle
     * 
     * @param quotaAllocation the quota allocation data
     * @return the created fuel quota
     */
    @Transactional
    public FuelQuota allocateQuota(QuotaAllocationDTO quotaAllocation) {
        log.info("Allocating new quota for vehicle ID: {}", quotaAllocation.getVehicleId());
        
        Vehicle vehicle = vehicleRepository.findById(quotaAllocation.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + quotaAllocation.getVehicleId()));
        
        // Create new quota
        FuelQuota newQuota = FuelQuota.builder()
                .vehicle(vehicle)
                .allocatedAmount(quotaAllocation.getAllocatedAmount())
                .remainingAmount(quotaAllocation.getAllocatedAmount()) // Initially, remaining amount equals allocated amount
                .allocationDate(quotaAllocation.getAllocationDate())
                .expiryDate(quotaAllocation.getExpiryDate())
                .build();
        
        return fuelQuotaRepository.save(newQuota);
    }
    
    /**
     * Deduct fuel from a vehicle's quota
     * 
     * @param vehicleId the vehicle ID
     * @param amount the amount to deduct
     * @return the updated fuel quota
     * @throws ResourceNotFoundException if no active quota is found
     * @throws InsufficientQuotaException if the quota is insufficient
     */
    @Transactional
    public FuelQuota deductQuota(Long vehicleId, BigDecimal amount) {
        log.info("Deducting {} liters from vehicle ID: {}", amount, vehicleId);
        
        FuelQuota currentQuota = fuelQuotaRepository.findCurrentQuotaByVehicleId(vehicleId, LocalDate.now())
                .orElseThrow(() -> new ResourceNotFoundException("No active quota found for vehicle ID: " + vehicleId));
        
        if (!currentQuota.hasSufficientAmount(amount)) {
            throw new InsufficientQuotaException("Insufficient quota for vehicle ID: " + vehicleId);
        }
        
        currentQuota.deduct(amount);
        return fuelQuotaRepository.save(currentQuota);
    }
    
    /**
     * Check if a vehicle has sufficient quota
     * 
     * @param vehicleId the vehicle ID
     * @param amount the amount to check
     * @return true if the vehicle has sufficient quota, false otherwise
     */
    public boolean hasSufficientQuota(Long vehicleId, BigDecimal amount) {
        log.info("Checking if vehicle ID: {} has sufficient quota for {} liters", vehicleId, amount);
        
        Optional<FuelQuota> currentQuotaOpt = fuelQuotaRepository.findCurrentQuotaByVehicleId(vehicleId, LocalDate.now());
        
        if (currentQuotaOpt.isEmpty()) {
            return false;
        }
        
        return currentQuotaOpt.get().hasSufficientAmount(amount);
    }
}
