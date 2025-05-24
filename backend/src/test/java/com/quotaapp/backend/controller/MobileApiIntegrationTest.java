package com.quotaapp.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quotaapp.backend.dto.mobile.MobileLoginRequestDTO;
import com.quotaapp.backend.dto.mobile.MobileStationRegistrationDTO;
import com.quotaapp.backend.model.*;
import com.quotaapp.backend.repository.primary.*;
import com.quotaapp.backend.security.JwtTokenUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Mobile API endpoints
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class MobileApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StationOwnerRepository stationOwnerRepository;

    @Autowired
    private FuelStationRepository fuelStationRepository;

    @Autowired
    private ProvinceRepository provinceRepository;

    @Autowired
    private DistrictRepository districtRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    private Province testProvince;
    private District testDistrict;
    private User testUser;
    private StationOwner testStationOwner;
    private FuelStation testStation;
    private String authToken;

    @BeforeEach
    void setUp() {
        // Create test province and district
        testProvince = Province.builder()
                .name("Western")
                .build();
        testProvince = provinceRepository.save(testProvince);

        testDistrict = District.builder()
                .name("Colombo")
                .province(testProvince)
                .build();
        testDistrict = districtRepository.save(testDistrict);

        // Create test user
        testUser = User.builder()
                .email("test.station@example.com")
                .password(passwordEncoder.encode("TestPass123!"))
                .role(Role.STATION_OWNER)
                .isActive(true)
                .emailVerified(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        testUser = userRepository.save(testUser);

        // Create test station owner
        testStationOwner = StationOwner.builder()
                .user(testUser)
                .fullName("Test Station Owner")
                .nicNumber("123456789V")
                .contactNumber("0771234567")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        testStationOwner = stationOwnerRepository.save(testStationOwner);

        // Create test station
        testStation = FuelStation.builder()
                .owner(testStationOwner)
                .stationName("Test Fuel Station")
                .businessName("Test Business")
                .businessAddress("123 Test Street, Colombo")
                .businessRegistrationNumber("BR123456")
                .fuelRetailLicenseNumber("FRL123456")
                .openingTime(LocalTime.of(6, 0))
                .closingTime(LocalTime.of(22, 0))
                .province(testProvince)
                .district(testDistrict)
                .verificationStatus("VERIFIED")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        testStation = fuelStationRepository.save(testStation);

        // Generate auth token
        authToken = jwtTokenUtil.generateToken(testUser.getEmail());
    }

    @Test
    void testMobileRegistration() throws Exception {
        MobileStationRegistrationDTO registrationDTO = MobileStationRegistrationDTO.builder()
                .email("new.station@example.com")
                .password("NewPass123!")
                .fullName("New Station Owner")
                .nicNumber("987654321V")
                .contactNumber("0779876543")
                .stationName("New Fuel Station")
                .businessName("New Business")
                .businessAddress("456 New Street, Colombo")
                .businessRegistrationNumber("BR789012")
                .fuelRetailLicenseNumber("FRL789012")
                .openingTime("06:00")
                .closingTime("22:00")
                .province("Western")
                .district("Colombo")
                .build();

        mockMvc.perform(post("/api/mobile/auth/register/station")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registrationDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.user.email").value("new.station@example.com"))
                .andExpect(jsonPath("$.data.stationOwner.fullName").value("New Station Owner"))
                .andExpect(jsonPath("$.data.station.stationName").value("New Fuel Station"));
    }

    @Test
    void testMobileLogin() throws Exception {
        MobileLoginRequestDTO loginDTO = MobileLoginRequestDTO.builder()
                .email("test.station@example.com")
                .password("TestPass123!")
                .build();

        mockMvc.perform(post("/api/mobile/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.user.email").value("test.station@example.com"))
                .andExpect(jsonPath("$.data.stationOwner.fullName").value("Test Station Owner"))
                .andExpect(jsonPath("$.data.station.stationName").value("Test Fuel Station"));
    }

    @Test
    void testGetProvinces() throws Exception {
        mockMvc.perform(get("/api/mobile/auth/provinces"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0]").value("Western"));
    }

    @Test
    void testGetDistricts() throws Exception {
        mockMvc.perform(get("/api/mobile/auth/districts/Western"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0]").value("Colombo"));
    }

    @Test
    void testGetStationDetails() throws Exception {
        mockMvc.perform(get("/api/mobile/station/details")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.stationName").value("Test Fuel Station"))
                .andExpect(jsonPath("$.data.owner.fullName").value("Test Station Owner"));
    }

    @Test
    void testGetStationTransactions() throws Exception {
        mockMvc.perform(get("/api/mobile/station/transactions")
                .header("Authorization", "Bearer " + authToken)
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    void testGetStationNotifications() throws Exception {
        mockMvc.perform(get("/api/mobile/station/notifications")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void testUnauthorizedAccess() throws Exception {
        mockMvc.perform(get("/api/mobile/station/details"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testInvalidLogin() throws Exception {
        MobileLoginRequestDTO loginDTO = MobileLoginRequestDTO.builder()
                .email("test.station@example.com")
                .password("WrongPassword")
                .build();

        mockMvc.perform(post("/api/mobile/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void testDuplicateRegistration() throws Exception {
        MobileStationRegistrationDTO registrationDTO = MobileStationRegistrationDTO.builder()
                .email("test.station@example.com") // Already exists
                .password("NewPass123!")
                .fullName("Duplicate Station Owner")
                .nicNumber("111222333V")
                .contactNumber("0771111111")
                .stationName("Duplicate Station")
                .businessName("Duplicate Business")
                .businessAddress("789 Duplicate Street, Colombo")
                .businessRegistrationNumber("BR111222")
                .fuelRetailLicenseNumber("FRL111222")
                .openingTime("06:00")
                .closingTime("22:00")
                .province("Western")
                .district("Colombo")
                .build();

        mockMvc.perform(post("/api/mobile/auth/register/station")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registrationDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Email is already registered"));
    }

    @Test
    void testGetVehicleByRegistration() throws Exception {
        // This test would require a vehicle to be created in the database
        // For now, we'll test the endpoint structure
        mockMvc.perform(get("/api/station/quota/vehicle/ABC1234")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isNotFound()); // Expected since no vehicle exists
    }

    @Test
    void testCorsHeaders() throws Exception {
        mockMvc.perform(options("/api/mobile/auth/login")
                .header("Origin", "http://localhost:3000")
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "Authorization, Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().exists("Access-Control-Allow-Origin"))
                .andExpect(header().exists("Access-Control-Allow-Methods"));
    }

    @Test
    void testMobileAppHeaders() throws Exception {
        mockMvc.perform(get("/api/mobile/station/details")
                .header("Authorization", "Bearer " + authToken)
                .header("X-Mobile-App", "quota-app")
                .header("X-App-Version", "1.0.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
