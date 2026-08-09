export interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
}

export interface BookingAvailabilityResponseDTO {
  date: string;
  availableSlots: TimeSlot[];
}

export interface CreateBookingRequestDTO {
  fullName: string;
  phone: string;
  deviceType: string;
  date: string;
  timeSlotId: string;
  notes?: string;
}

export interface CreateBookingResponseDTO {
  message: string;
  bookingId: string;
  status: string;
}
