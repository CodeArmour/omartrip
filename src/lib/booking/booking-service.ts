import type {
  AvailabilityResponse,
  BookingResult,
  BookingService,
  CreateBookingInput,
} from "./booking-types";

const BACKEND_URL = (
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:8081"
).replace(/\/$/, "");

type BackendError = {
  code?: string;
  status?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
};

async function readJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

class SpringBookingService implements BookingService {
  async getAvailability(input: {
    month: string;
    date?: string;
  }): Promise<AvailabilityResponse> {
    const query = new URLSearchParams({ month: input.month });
    if (input.date) query.set("date", input.date);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/bookings/availability?${query}`,
        { cache: "no-store", signal: AbortSignal.timeout(8_000) },
      );
      const body = await readJson<AvailabilityResponse | BackendError>(
        response,
      );
      if (!response.ok || !body || !("availableDates" in body)) {
        throw new Error("Availability request failed");
      }
      return body;
    } catch {
      return {
        mode: "preview",
        configured: false,
        timezone: "Europe/Brussels",
        utcOffset: "",
        durationMinutes: 30,
        availableDates: [],
        slots: [],
        message:
          "Live booking availability is temporarily unavailable. Please try again shortly.",
      };
    }
  }

  async createBooking(input: CreateBookingInput): Promise<BookingResult> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/bookings/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      const body = await readJson<BookingResult | BackendError>(response);

      if (response.ok && body && "status" in body) {
        return body as BookingResult;
      }

      const error = (body ?? {}) as BackendError;
      return {
        status: response.status === 409 ? "conflict" : "invalid",
        message:
          error.message ??
          (response.status === 409
            ? "That time is no longer available. Please select another slot."
            : "The booking request could not be processed."),
        fieldErrors: error.fieldErrors,
      };
    } catch {
      return {
        status: "configuration-unavailable",
        message:
          "The booking service could not be reached. Please try again later.",
      };
    }
  }
}

export const bookingService: BookingService = new SpringBookingService();
