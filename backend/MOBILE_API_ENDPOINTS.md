# Mobile API Endpoints Documentation

## Overview
This document outlines all the mobile API endpoints implemented for the quota.app mobile application for fuel station operators.

## Authentication Endpoints

### 1. Mobile Registration
**POST** `/api/mobile/auth/register/station`

**Description:** Single-step station owner registration optimized for mobile UX

**Request Body:**
```json
{
  "email": "station@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "nicNumber": "123456789V",
  "contactNumber": "0771234567",
  "stationName": "ABC Fuel Station",
  "businessName": "ABC Business",
  "businessAddress": "123 Main Street, Colombo",
  "businessRegistrationNumber": "BR123456",
  "fuelRetailLicenseNumber": "FRL123456",
  "openingTime": "06:00",
  "closingTime": "22:00",
  "province": "Western",
  "district": "Colombo"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Your account is pending admin verification.",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "email": "station@example.com",
      "role": "STATION_OWNER",
      "isActive": false
    },
    "stationOwner": {
      "id": 1,
      "fullName": "John Doe",
      "contactNumber": "0771234567"
    },
    "station": {
      "id": 1,
      "stationName": "ABC Fuel Station",
      "verificationStatus": "PENDING",
      "isActive": false
    }
  }
}
```

### 2. Mobile Login
**POST** `/api/mobile/auth/login`

**Request Body:**
```json
{
  "email": "station@example.com",
  "password": "SecurePass123!"
}
```

**Response:** Same structure as registration response

### 3. Get Provinces
**GET** `/api/mobile/auth/provinces`

**Response:**
```json
{
  "success": true,
  "message": "Provinces retrieved successfully",
  "data": ["Western", "Central", "Southern", ...]
}
```

### 4. Get Districts
**GET** `/api/mobile/auth/districts/{provinceName}`

**Response:**
```json
{
  "success": true,
  "message": "Districts retrieved successfully",
  "data": ["Colombo", "Gampaha", "Kalutara", ...]
}
```

## Station Management Endpoints

### 5. Get Station Details
**GET** `/api/mobile/station/details`
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Station details retrieved successfully",
  "data": {
    "id": 1,
    "stationName": "ABC Fuel Station",
    "businessName": "ABC Business",
    "businessAddress": "123 Main Street, Colombo",
    "businessRegistrationNumber": "BR123456",
    "fuelRetailLicenseNumber": "FRL123456",
    "openingTime": "06:00",
    "closingTime": "22:00",
    "province": "Western",
    "district": "Colombo",
    "verificationStatus": "VERIFIED",
    "isActive": true,
    "owner": {
      "id": 1,
      "fullName": "John Doe",
      "nicNumber": "123456789V",
      "contactNumber": "0771234567",
      "user": {
        "id": 1,
        "email": "station@example.com",
        "role": "STATION_OWNER",
        "isActive": true,
        "lastLogin": "2024-01-15T10:30:00"
      }
    }
  }
}
```

### 6. Get Station Transactions
**GET** `/api/mobile/station/transactions?page=0&size=10&startDate=2024-01-01T00:00:00&endDate=2024-01-31T23:59:59`
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "vehicleId": 1,
        "vehicleRegistrationNumber": "ABC1234",
        "stationId": 1,
        "stationName": "ABC Fuel Station",
        "fuelType": "OCTANE_92",
        "amount": 25.50,
        "unitPrice": 365.00,
        "totalPrice": 9307.50,
        "transactionDate": "2024-01-15T14:30:00"
      }
    ],
    "pageable": {...},
    "totalElements": 1,
    "totalPages": 1
  }
}
```

### 7. Get Station Notifications
**GET** `/api/mobile/station/notifications`
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Registration Successful",
      "message": "Your station registration is pending admin verification.",
      "type": "REGISTRATION",
      "isRead": false,
      "createdAt": "2024-01-15T10:00:00"
    }
  ]
}
```

### 8. Update Station Profile
**PUT** `/api/mobile/station/profile`
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "fullName": "John Updated Doe",
  "contactNumber": "0779876543",
  "stationName": "ABC Updated Fuel Station",
  "businessAddress": "456 Updated Street, Colombo",
  "openingTime": "05:30",
  "closingTime": "23:00"
}
```

**Response:** Same structure as station details

## Vehicle Management Endpoints

### 9. Get Vehicle by Registration Number
**GET** `/api/station/quota/vehicle/{registrationNumber}`
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Vehicle found successfully",
  "data": {
    "vehicleId": 1,
    "registrationNumber": "ABC1234",
    "make": "Toyota",
    "model": "Corolla",
    "year": 2020,
    "fuelType": "OCTANE_92",
    "vehicleClass": "B"
  }
}
```

### 10. Validate Vehicle Quota
**GET** `/api/station/quota/validate/{vehicleId}`
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Quota validation successful",
  "data": {
    "vehicleId": 1,
    "totalQuota": 40.0,
    "usedAmount": 15.5,
    "remainingAmount": 24.5,
    "quotaStatus": "AVAILABLE",
    "lastRefuelDate": "2024-01-10T14:30:00",
    "nextRefuelDate": "2024-01-17T14:30:00"
  }
}
```

### 11. Dispense Fuel
**POST** `/api/station/quota/dispense`
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "vehicleId": 1,
  "stationId": 1,
  "fuelType": "OCTANE_92",
  "amount": 25.0,
  "unitPrice": 365.00
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fuel dispensed successfully",
  "data": {
    "transactionId": 1,
    "vehicleId": 1,
    "amount": 25.0,
    "totalPrice": 9125.00,
    "remainingQuota": 15.0,
    "transactionDate": "2024-01-15T14:30:00"
  }
}
```

## Security Features

### CORS Configuration
- Supports both web frontends and mobile apps
- Mobile apps can access APIs without origin restrictions
- Custom headers: `X-Mobile-App`, `X-App-Version`

### Authentication
- JWT token-based authentication
- Tokens include user role and permissions
- Automatic token validation on protected endpoints

### SMS Notifications
- Twilio integration for SMS notifications
- Transaction confirmations
- Quota warnings
- Registration confirmations

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Mobile App Integration

The mobile app should:

1. Include `X-Mobile-App: quota-app` header in requests
2. Store JWT token securely using Expo SecureStore
3. Handle token expiration and refresh
4. Implement proper error handling for all API calls
5. Use pagination for transaction lists
6. Implement offline capability where appropriate

## Testing

All endpoints have been implemented and are ready for integration testing with the mobile application. The backend supports:

- User registration and authentication
- Station management
- Vehicle validation and quota checking
- Fuel dispensing transactions
- Notifications and SMS integration
- Proper security and CORS configuration

The mobile API is fully functional and ready for production use.
