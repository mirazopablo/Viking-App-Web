/**
 * Device hardware inventory contracts.
 * Linked via foreign key userId to the device owner.
 */

export interface DeviceResponseDTO {
  id: string;                 // UUID
  userId: string;             // UUID - Owner reference
  userDni?: number;
  userName?: string;
  userPhone?: string;
  brand: string;
  model: string;
  serialNumber: string;       // Unique hardware identifier (readOnly on edit)
  createdAt?: string;
}

export interface DeviceCreateDTO {
  userId: string;             // UUID
  userID?: string;            // Go JSON binding compatibility
  type?: string;              // Hardware type (e.g., 'SMARTPHONE')
  brand: string;
  model: string;
  serialNumber: string;
}

export interface DeviceUpdateDTO extends Partial<DeviceCreateDTO> {
  id?: string;
}
