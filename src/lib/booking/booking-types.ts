export type AvailabilityRule = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type BookingSettings = {
  timezone: "Europe/Brussels";
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  minimumNoticeHours: number;
  maximumAdvanceDays: number;
};

export type AvailableSlot = {
  startsAt: string;
  endsAt: string;
};

export type AvailabilityResponse = {
  mode: "preview" | "live";
  configured: boolean;
  timezone: BookingSettings["timezone"];
  utcOffset: string;
  durationMinutes: number;
  availableDates: string[];
  slots: AvailableSlot[];
  message?: string;
};

export type CreateBookingInput = {
  startsAt: string;
  fullName: string;
  email: string;
  topic: string;
  idempotencyKey: string;
  company?: string;
};

export type BookingResult =
  | {
      status: "pending";
      startsAt: string;
      durationMinutes: number;
      email: string;
    }
  | {
      status: "configuration-unavailable" | "conflict" | "invalid" | "error";
      message: string;
      fieldErrors?: Record<string, string>;
    };

export interface BookingService {
  getAvailability(input: {
    month: string;
    date?: string;
    now?: Date;
  }): Promise<AvailabilityResponse>;
  createBooking(input: CreateBookingInput): Promise<BookingResult>;
}
