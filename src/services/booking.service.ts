import { apiClient } from "@/lib/api-client";
import { 
  BookingAvailabilityResponseDTO, 
  CreateBookingRequestDTO, 
  CreateBookingResponseDTO 
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
  }
};
