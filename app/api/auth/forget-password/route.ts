// app/api/auth/forget-password/route.ts
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://7257-82-36-98-104.ngrok-free.app/supservice/api/v1/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("=== Supplier Forgot Password API Route ===");
    console.log("Forgot password attempt for:", body.email);

    if (!body.email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const backendUrl = `${BACKEND_URL}/suppliers/forgot-password`;
    console.log("Calling backend:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        email: body.email,
      }),
      cache: "no-store",
    });

    const rawResponse = await response.text();
    console.log("Backend status:", response.status);
    console.log("Raw backend response:", rawResponse);

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch {
      data = {
        message:
          rawResponse ||
          "If an account exists for that email, a verification code has been sent.",
      };
    }

    // The backend always returns 200 for enumeration safety.
    // Forward that 200 to the client even if the email doesn't exist —
    // the message already conveys "we sent a code if the account exists."
    return NextResponse.json(
      {
        success: true,
        message:
          data?.message ||
          "If an account exists for that email, a verification code has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Supplier forgot-password API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}