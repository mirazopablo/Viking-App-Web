/**
 * User domain contracts matching OpenAPI specification and Viking-App-Front.
 * Incorporates PII protection rules where DNI and primary email are readOnly during updates.
 */

export interface UserResponseDTO {
  id: string;                 // UUID
  name: string;
  dni: number;                // int32 - Immutable PII field
  address: string;
  phoneNumber: string;
  secondaryPhoneNumber?: string;
  email: string;              // Immutable PII field
  roleId?: string;
}

export interface UserAutocompleteDTO {
  id: string;
  name: string;
  dni: number;
  phoneNumber?: string;
}

export interface UserCreateDTO {
  name: string;
  dni: number;
  address: string;
  phoneNumber: string;
  secondaryPhoneNumber?: string;
  email: string;
  password?: string;
  roleId?: string;
}

/**
 * Partial update DTO.
 * Frontend forms will omit dni and email when dispatching PATCH requests to preserve PII integrity.
 */
export interface UserUpdateDTO extends Partial<UserCreateDTO> {
  id?: string;
}
