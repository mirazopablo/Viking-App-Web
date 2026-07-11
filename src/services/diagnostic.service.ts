import { apiClient } from "@/lib/api-client";
import { DiagnosticPointResponseDTO, DiagnosticPointCreateDTO } from "@/types/diagnostic";
import { workOrderService } from "./work-order.service";

/**
 * Diagnostic Service:
 * Manages fetching technical triage timelines and uploading multipart/form-data evidence.
 */
export const diagnosticService = {
  /**
   * Retrieves all diagnostic points associated with a specific work order UUID.
   * Uses decoupled endpoint that does not require clientId.
   * @param workOrderId - Work Order UUID.
   */
  getDiagnosticPoints: async (workOrderId: string): Promise<DiagnosticPointResponseDTO[]> => {
    const response = await apiClient.get<DiagnosticPointResponseDTO[]>(
      `/api/diagnostic-points/by-work-order/${workOrderId}`
    );
    return response.data || [];
  },

  /**
   * Creates a new diagnostic point with optional image attachment.
   * Uses FormData (multipart/form-data) to transmit binary image blobs to the backend.
   * 
   * @param data - DTO containing workOrderId, title, and description.
   * @param imageFile - Optional File object from input[type="file"].
   */
  createDiagnosticPoint: async (
    data: DiagnosticPointCreateDTO & { clientId?: string },
    imageFile?: File
  ): Promise<DiagnosticPointResponseDTO> => {
    const formData = new FormData();
    formData.append("workOrderId", data.workOrderId);
    
    let clientId = data.clientId;
    if (!clientId) {
      try {
        const workOrder = await workOrderService.getWorkOrderById(data.workOrderId);
        clientId = workOrder.clientId;
      } catch {
        clientId = "";
      }
    }
    if (clientId) {
      formData.append("clientId", clientId);
    }

    formData.append("title", data.title);
    formData.append("description", data.description);
    
    // Go controller expects 'file' field and requires a file upload
    const fileToUpload = imageFile || new File([""], "diagnostic.jpg", { type: "image/jpeg" });
    formData.append("file", fileToUpload);
    formData.append("image", fileToUpload);

    // Axios automatically overrides Content-Type to multipart/form-data with proper boundary when passing FormData
    const response = await apiClient.post<DiagnosticPointResponseDTO>("/api/diagnostic-points/add", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  /**
   * Deletes a specific diagnostic point and its associated evidence image by UUID.
   * @param id - Diagnostic point UUID.
   */
  deleteDiagnosticPoint: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/diagnostic-points/delete/${id}`);
  },
};


