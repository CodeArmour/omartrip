import { NextResponse } from "next/server";

import { bookingService } from "@/lib/booking/booking-service";
import { validateBookingInput } from "@/lib/booking/booking-validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: "invalid", message: "Invalid request." },
      { status: 400 },
    );
  }
  const { normalized, fieldErrors, valid } = validateBookingInput(body);
  if (normalized.company)
    return NextResponse.json(
      { status: "error", message: "Request could not be processed." },
      { status: 400 },
    );
  if (!valid) {
    return NextResponse.json(
      {
        status: "invalid",
        message: "Please review the highlighted fields.",
        fieldErrors,
      },
      { status: 400 },
    );
  }
  const result = await bookingService.createBooking(normalized);
  const status =
    result.status === "pending"
      ? 201
      : result.status === "conflict"
        ? 409
        : result.status === "configuration-unavailable"
          ? 503
          : 400;
  return NextResponse.json(result, { status });
}
