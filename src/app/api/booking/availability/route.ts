import { NextResponse } from "next/server";

import { bookingService } from "@/lib/booking/booking-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? "";
  const date = searchParams.get("date") ?? undefined;
  if (
    !/^\d{4}-\d{2}$/.test(month) ||
    (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))
  ) {
    return NextResponse.json(
      { message: "Invalid availability query." },
      { status: 400 },
    );
  }
  return NextResponse.json(
    await bookingService.getAvailability({ month, date }),
  );
}
