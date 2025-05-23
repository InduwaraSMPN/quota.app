package com.quotaapp.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.quotaapp.backend.dto.transaction.TransactionCreateDTO;
import com.quotaapp.backend.dto.transaction.TransactionDetailsDTO;
import com.quotaapp.backend.exception.InsufficientQuotaException;
import com.quotaapp.backend.exception.ResourceNotFoundException;
import com.quotaapp.backend.model.FuelStation;
import com.quotaapp.backend.model.FuelTransaction;
import com.quotaapp.backend.model.Vehicle;
import com.quotaapp.backend.repository.primary.FuelStationRepository;
import com.quotaapp.backend.repository.primary.FuelTransactionRepository;
import com.quotaapp.backend.repository.primary.VehicleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for managing fuel transactions
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FuelTransactionService {

    private final FuelTransactionRepository fuelTransactionRepository;
    private final VehicleRepository vehicleRepository;
    private final FuelStationRepository fuelStationRepository;
    private final FuelQuotaService fuelQuotaService;
    
    /**
     * Create a new fuel transaction
     * 
     * @param transactionCreate the transaction data
     * @return the created transaction
     * @throws ResourceNotFoundException if the vehicle or station is not found
     * @throws InsufficientQuotaException if the vehicle has insufficient quota
     */
    @Transactional
    public FuelTransaction createTransaction(TransactionCreateDTO transactionCreate) {
        log.info("Creating new transaction for vehicle ID: {} at station ID: {}", 
                transactionCreate.getVehicleId(), transactionCreate.getStationId());
        
        Vehicle vehicle = vehicleRepository.findById(transactionCreate.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + transactionCreate.getVehicleId()));
        
        FuelStation station = fuelStationRepository.findById(transactionCreate.getStationId())
                .orElseThrow(() -> new ResourceNotFoundException("Fuel station not found with ID: " + transactionCreate.getStationId()));
        
        // Check if the vehicle has sufficient quota
        if (!fuelQuotaService.hasSufficientQuota(vehicle.getId(), transactionCreate.getAmount())) {
            throw new InsufficientQuotaException("Insufficient quota for vehicle ID: " + vehicle.getId());
        }
        
        // Deduct from the vehicle's quota
        fuelQuotaService.deductQuota(vehicle.getId(), transactionCreate.getAmount());
        
        // Create the transaction
        FuelTransaction transaction = FuelTransaction.builder()
                .vehicle(vehicle)
                .station(station)
                .fuelType(transactionCreate.getFuelType())
                .amount(transactionCreate.getAmount())
                .unitPrice(transactionCreate.getUnitPrice())
                .totalPrice(transactionCreate.getAmount().multiply(transactionCreate.getUnitPrice()))
                .transactionDate(LocalDateTime.now())
                .build();
        
        return fuelTransactionRepository.save(transaction);
    }
    
    /**
     * Get transaction details by ID
     * 
     * @param transactionId the transaction ID
     * @return the transaction details
     * @throws ResourceNotFoundException if the transaction is not found
     */
    public TransactionDetailsDTO getTransactionById(Long transactionId) {
        log.info("Getting transaction details for ID: {}", transactionId);
        
        FuelTransaction transaction = fuelTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + transactionId));
        
        return mapToTransactionDetailsDTO(transaction);
    }
    
    /**
     * Get all transactions for a vehicle
     * 
     * @param vehicleId the vehicle ID
     * @return a list of transaction details
     */
    public List<TransactionDetailsDTO> getTransactionsByVehicleId(Long vehicleId) {
        log.info("Getting all transactions for vehicle ID: {}", vehicleId);
        
        List<FuelTransaction> transactions = fuelTransactionRepository.findByVehicleId(vehicleId);
        
        return transactions.stream()
                .map(this::mapToTransactionDetailsDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all transactions for a vehicle with pagination
     * 
     * @param vehicleId the vehicle ID
     * @param pageable the pagination information
     * @return a page of transaction details
     */
    public Page<TransactionDetailsDTO> getTransactionsByVehicleId(Long vehicleId, Pageable pageable) {
        log.info("Getting transactions for vehicle ID: {} with pagination", vehicleId);
        
        Page<FuelTransaction> transactionsPage = fuelTransactionRepository.findByVehicleId(vehicleId, pageable);
        
        return transactionsPage.map(this::mapToTransactionDetailsDTO);
    }
    
    /**
     * Get all transactions for a station
     * 
     * @param stationId the station ID
     * @return a list of transaction details
     */
    public List<TransactionDetailsDTO> getTransactionsByStationId(Long stationId) {
        log.info("Getting all transactions for station ID: {}", stationId);
        
        List<FuelTransaction> transactions = fuelTransactionRepository.findByStationId(stationId);
        
        return transactions.stream()
                .map(this::mapToTransactionDetailsDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all transactions for a station with pagination
     * 
     * @param stationId the station ID
     * @param pageable the pagination information
     * @return a page of transaction details
     */
    public Page<TransactionDetailsDTO> getTransactionsByStationId(Long stationId, Pageable pageable) {
        log.info("Getting transactions for station ID: {} with pagination", stationId);
        
        Page<FuelTransaction> transactionsPage = fuelTransactionRepository.findByStationId(stationId, pageable);
        
        return transactionsPage.map(this::mapToTransactionDetailsDTO);
    }
    
    /**
     * Map a FuelTransaction entity to a TransactionDetailsDTO
     * 
     * @param transaction the transaction entity
     * @return the transaction details DTO
     */
    private TransactionDetailsDTO mapToTransactionDetailsDTO(FuelTransaction transaction) {
        return TransactionDetailsDTO.builder()
                .id(transaction.getId())
                .vehicleId(transaction.getVehicle().getId())
                .vehicleRegistrationNumber(transaction.getVehicle().getRegistrationNumber())
                .stationId(transaction.getStation().getId())
                .stationName(transaction.getStation().getStationName())
                .fuelType(transaction.getFuelType())
                .amount(transaction.getAmount())
                .unitPrice(transaction.getUnitPrice())
                .totalPrice(transaction.getTotalPrice())
                .transactionDate(transaction.getTransactionDate())
                .build();
    }
}
