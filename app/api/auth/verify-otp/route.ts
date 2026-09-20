// app/api/auth/verify-otp/route.ts
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://5836-82-36-98-104.ngrok-free.app/supservice/api/v1/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("=== Supplier Verify OTP API Route ===");

    // ✅ Only validate OTP — email comes from the JWT token
    if (!body.otp) {
      return NextResponse.json(
        { message: "OTP is required" },
        { status: 400 }
      );
    }

    // ✅ Get the Authorization header from the incoming request
    const authHeader = request.headers.get("authorization");
    console.log("Auth header present:", !!authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // ✅ Call your supplier-service verify-otp endpoint
    const backendUrl = `${BACKEND_URL}/suppliers/verify-otp`;
    console.log("Calling backend:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: authHeader,
      },
      // ✅ Only send OTP — email is extracted from the token
      body: JSON.stringify({
        otp: body.otp,
      }),
    });

    const rawResponse = await response.text();
    console.log("Backend status:", response.status);
    console.log("Raw backend response:", rawResponse);

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch {
      data = { message: rawResponse || "Verification failed" };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          message: data.message || data.error || "Verification failed",
          ...data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: data.success ?? true,
        message: data.message || "Email verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Supplier verify OTP API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}