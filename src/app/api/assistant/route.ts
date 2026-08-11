import { NextResponse } from "next/server";

const BACKEND_URL = (
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:8081"
).replace(/\/$/, "");

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const message =
    body && typeof body === "object" && "message" in body
      ? String(body.message).trim()
      : "";
  if (!message || message.length > 500) {
    return NextResponse.json(
      { message: "Enter a question within 500 characters." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/assistant/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const result = (await response.json()) as unknown;
    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "The portfolio assistant is temporarily unavailable." },
      { status: 503 },
    );
  }
}
