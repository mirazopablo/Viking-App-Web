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

export interface BlockedPeriod {
  id: string;
  date: string; // YYYY-MM-DD
  isFullDay: boolean;
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  reason?: string;
  createdAt: string;
}

export interface CreateBlockRequestDTO {
  date: string; // YYYY-MM-DD
  isFullDay: boolean;
  startTime?: string;
  endTime?: string;
  reason?: string;
}
