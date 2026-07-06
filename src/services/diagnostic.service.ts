import { apiClient } from "@/lib/api-client";
import { DiagnosticPointResponseDTO, DiagnosticPointCreateDTO } from "@/types/diagnostic";

/**
 * Diagnostic Service:
 * Manages fetching technical triage timelines and uploading multipart/form-data evidence.
 */
export const diagnosticService = {
  /**
   * Retrieves all diagnostic points associated with a specific work order UUID.
   * @param workOrderId - Work Order UUID.
   */
  getDiagnosticPoints: async (workOrderId: string): Promise<DiagnosticPointResponseDTO[]> => {
    const response = await apiClient.get<DiagnosticPointResponseDTO[]>("/diagnostic-points", {
      params: { workOrderId },
    });
    return response.data;
  },

  /**
   * Creates a new diagnostic point with optional image attachment.
   * Uses FormData (multipart/form-data) to transmit binary image blobs to the backend.
   * 
   * @param data - DTO containing workOrderId, title, and description.
   * @param imageFile - Optional File object from input[type="file"].
   */
  createDiagnosticPoint: async (
    data: DiagnosticPointCreateDTO,
    imageFile?: File
  ): Promise<DiagnosticPointResponseDTO> => {
    const formData = new FormData();
    formData.append("workOrderId", data.workOrderId);
    formData.append("title", data.title);
    formData.append("description", data.description);
    
    if (imageFile) {
      // Append binary evidence file
      formData.append("image", imageFile);
    }

    // Axios automatically overrides Content-Type to multipart/form-data with proper boundary when passing FormData
    const response = await apiClient.post<DiagnosticPointResponseDTO>("/diagnostic-points", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};
