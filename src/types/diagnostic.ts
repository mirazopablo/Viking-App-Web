/**
 * Diagnostic Point contracts matching OpenAPI specification and Viking-App-Front.
 * Supports multipart/form-data evidence uploading with image blobs and JSON text.
 */

export interface DiagnosticPointResponseDTO {
  id: string;               // UUID
  workOrderId: string;      // UUID
  staffId: string;          // UUID
  title: string;
  description: string;
  imageUrl?: string;        // Path or URL to stored evidence image
  createdAt: string;        // ISO-8601 Date-Time
}

export interface DiagnosticPointCreateDTO {
  workOrderId: string;      // UUID
  title: string;
  description: string;
}
