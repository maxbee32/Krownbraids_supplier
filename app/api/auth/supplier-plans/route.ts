// app/api/auth/supplier-plans/route.ts
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://5836-82-36-98-104.ngrok-free.app/aservice/api/v1/auth";

/**
 * Public — list active supplier plans.
 * Used by the onboarding wizard (no auth required).
 */
export async function GET() {
  try {
    console.log("=== Get Public Supplier Plans ===");

    const backendUrl = `${BACKEND_URL}/supplier-subscription-plans/active`;
    console.log("Calling backend:", backendUrl);

    const response = await fetch(backendUrl, {
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    const rawResponse = await response.text();
    console.log("Backend status:", response.status);
    console.log("Raw response:", rawResponse);

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch {
      data = { message: rawResponse || "Failed to fetch plans" };
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to fetch plans" },
        { status: response.status }
      );
    }

    // Backend returns array directly — pass through
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Public supplier plans error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}