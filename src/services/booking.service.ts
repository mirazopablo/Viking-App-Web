import { apiClient } from "@/lib/api-client";
import { 
  BookingAvailabilityResponseDTO, 
  CreateBookingRequestDTO, 
  CreateBookingResponseDTO,
  BlockedPeriod,
  CreateBlockRequestDTO
} from "@/types/booking";

export const bookingService = {
  getAvailability: async (date: string, deviceType?: string): Promise<BookingAvailabilityResponseDTO> => {
    const response = await apiClient.get<BookingAvailabilityResponseDTO>(
      "/api/v1/bookings/availability",
      { params: { date, deviceType } }
    );
    return response.data;
  },

  createBooking: async (data: CreateBookingRequestDTO): Promise<CreateBookingResponseDTO> => {
    const response = await apiClient.post<CreateBookingResponseDTO>(
      "/api/v1/bookings",
      data
    );
    return response.data;
  },

  getBlockedPeriods: async (): Promise<BlockedPeriod[]> => {
    const response = await apiClient.get<BlockedPeriod[]>("/api/v1/bookings/blocks");
    return response.data;
  },

  createBlockedPeriod: async (data: CreateBlockRequestDTO): Promise<BlockedPeriod> => {
    const response = await apiClient.post<BlockedPeriod>("/api/v1/bookings/blocks", data);
    return response.data;
  },

  deleteBlockedPeriod: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/bookings/blocks/${id}`);
  }
};
