// app/api/auth/onboarding/route.ts
import { NextResponse } from "next/server";

const SUPPLIER_SERVICE_URL =
  process.env.SUPPLIER_SERVICE_URL ||
  "https://58bb-82-36-98-104.ngrok-free.app/supservice/api/v1/auth";


/**
 * Save supplier business onboarding.
 * POST /api/auth/onboarding
 */
export async function POST(request: Request) {
  try {
    console.log("=== Supplier Onboarding API Route ===");

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Onboarding payload:", body);

    // ✅ Forward to supplier-service
    const backendUrl = `${SUPPLIER_SERVICE_URL}/suppliers/onboarding`;
    console.log("Calling backend:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(body),
    });

    const rawResponse = await response.text();
    console.log("Backend status:", response.status);
    console.log("Raw response:", rawResponse);

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch {
      data = { message: rawResponse || "Failed to save onboarding" };
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to save onboarding" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Supplier onboarding error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}