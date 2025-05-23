package com.quotaapp.backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

import com.quotaapp.backend.dto.transaction.TransactionCreateDTO;
import com.quotaapp.backend.dto.transaction.TransactionDetailsDTO;
import com.quotaapp.backend.exception.InsufficientQuotaException;
import com.quotaapp.backend.exception.ResourceNotFoundException;
import com.quotaapp.backend.model.FuelStation;
import com.quotaapp.backend.model.FuelTransaction;
import com.quotaapp.backend.model.FuelType;
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

    @PersistenceContext
    private EntityManager entityManager;

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
     * Get all transactions for a station with pagination and filters
     *
     * @param stationId the station ID
     * @param startDateStr optional start date filter (ISO format string)
     * @param endDateStr optional end date filter (ISO format string)
     * @param fuelTypeStr optional fuel type filter
     * @param pageable the pagination information
     * @return a page of transaction details
     */
    public Page<TransactionDetailsDTO> getTransactionsByStationId(
            Long stationId,
            String startDateStr,
            String endDateStr,
            String fuelTypeStr,
            Pageable pageable) {

        log.info("Getting transactions for station ID: {} with filters - startDate: {}, endDate: {}, fuelType: {}",
                stationId, startDateStr, endDateStr, fuelTypeStr);

        // If no filters are provided, use the standard method
        if ((startDateStr == null || startDateStr.isEmpty()) &&
            (endDateStr == null || endDateStr.isEmpty()) &&
            (fuelTypeStr == null || fuelTypeStr.isEmpty())) {
            return getTransactionsByStationId(stationId, pageable);
        }

        // Build a dynamic query based on the provided filters
        StringBuilder queryBuilder = new StringBuilder("SELECT t FROM FuelTransaction t WHERE t.station.id = :stationId");
        Map<String, Object> params = new HashMap<>();
        params.put("stationId", stationId);

        // Add date range filter if provided
        if (startDateStr != null && !startDateStr.isEmpty() && endDateStr != null && !endDateStr.isEmpty()) {
            try {
                LocalDateTime startDate = LocalDateTime.parse(startDateStr);
                LocalDateTime endDate = LocalDateTime.parse(endDateStr);

                queryBuilder.append(" AND t.transactionDate BETWEEN :startDate AND :endDate");
                params.put("startDate", startDate);
                params.put("endDate", endDate);
            } catch (Exception e) {
                log.warn("Invalid date format: startDate={}, endDate={}", startDateStr, endDateStr);
            }
        }

        // Add fuel type filter if provided
        if (fuelTypeStr != null && !fuelTypeStr.isEmpty()) {
            try {
                FuelType fuelType = FuelType.valueOf(fuelTypeStr);
                queryBuilder.append(" AND t.fuelType = :fuelType");
                params.put("fuelType", fuelType);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid fuel type: {}", fuelTypeStr);
            }
        }

        // Add sorting
        queryBuilder.append(" ORDER BY t.transactionDate DESC");

        // Create the query
        TypedQuery<FuelTransaction> query = entityManager.createQuery(queryBuilder.toString(), FuelTransaction.class);

        // Set parameters
        for (Map.Entry<String, Object> entry : params.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }

        // Set pagination
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());

        // Execute the query
        List<FuelTransaction> transactions = query.getResultList();

        // Count total elements
        TypedQuery<Long> countQuery = entityManager.createQuery(
                queryBuilder.toString().replace("SELECT t", "SELECT COUNT(t)"), Long.class);

        // Set parameters for count query
        for (Map.Entry<String, Object> entry : params.entrySet()) {
            countQuery.setParameter(entry.getKey(), entry.getValue());
        }

        // Get total count
        long total = countQuery.getSingleResult();

        // Create page
        Page<FuelTransaction> transactionsPage = new PageImpl<>(transactions, pageable, total);

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
