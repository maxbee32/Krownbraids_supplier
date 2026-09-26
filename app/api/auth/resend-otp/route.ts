// app/api/auth/resend-otp/route.ts
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://58bb-82-36-98-104.ngrok-free.app/supservice/api/v1/auth";

export async function POST(request: Request) {
  try {
    console.log("=== Supplier Resend OTP API Route ===");

    // ✅ Get the Authorization header from the incoming request
    const authHeader = request.headers.get("authorization");
    console.log("Auth header present:", !!authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // ✅ Call your auth-service resend-otp endpoint
    const backendUrl = `${BACKEND_URL}/suppliers/resend-otp`;
    console.log("Calling backend:", backendUrl);

    // ✅ No body needed — email comes from the JWT token
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: authHeader,
      },
    });

    const rawResponse = await response.text();
    console.log("Backend status:", response.status);
    console.log("Raw backend response:", rawResponse);

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch {
      data = { message: rawResponse || "Failed to resend code" };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          message: data.message || data.error || "Failed to resend code",
          ...data,
        },
        { status: response.status }
      );
    }

    // ✅ Backend returns: { success: true, message: "...", data: null }
    return NextResponse.json(
      {
        success: data.success ?? true,
        message: data.message || "New code sent to your email",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Supplier resend OTP API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}