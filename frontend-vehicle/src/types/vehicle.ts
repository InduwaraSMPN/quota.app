// Vehicle and quota related type definitions

export interface Quota {
  totalQuota: number;
  remainingQuota: number;
  quotaUnit: string;
  lastUpdated: string;
  nextRefill: string;
}

export interface Vehicle {
  id: string;
  ownerId: string;  // Added owner ID
  registrationNumber: string;
  engineNumber: string;
  chassisNumber: string;
  make: string;
  model: string;
  yearOfManufacture: string;
  vehicleClass: string;
  typeOfBody: string;
  fuelType: string;
  engineCapacity: string;
  color: string;
  dateOfFirstRegistration: string;
  quota: Quota;
}

export interface VehicleResponse {
  vehicles: Vehicle[];
}
