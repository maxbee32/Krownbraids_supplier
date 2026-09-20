// app/api/auth/onboarding/status/route.ts
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://5836-82-36-98-104.ngrok-free.app/supservice/api/v1/auth";

export async function GET(request: Request) {
  try {
    console.log("=== Onboarding Status API Route ===");

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const backendUrl = `${BACKEND_URL}/suppliers/onboarding/status`;
    console.log("Calling backend:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: authHeader,
      },
    });

    const rawResponse = await response.text();
    console.log("Backend status:", response.status);

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch {
      data = { message: rawResponse || "Failed to fetch status" };
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to fetch status", ...data },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Onboarding status API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}