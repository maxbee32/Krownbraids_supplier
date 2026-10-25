// app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://7257-82-36-98-104.ngrok-free.app/supservice/api/v1/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("=== Supplier Reset Password API Route ===");
    console.log("Reset password attempt for:", body.email);

    if (!body.email || !body.otp || !body.newPassword) {
      return NextResponse.json(
        { message: "Email, verification code, and new password are required" },
        { status: 400 }
      );
    }

    const backendUrl = `${BACKEND_URL}/suppliers/reset-password`;
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
        otp: body.otp,
        newPassword: body.newPassword,
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
      data = { message: rawResponse || "Password reset failed" };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            data.message ||
            data.error ||
            "Could not reset password. Check the code and try again.",
          ...data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          data?.message ||
          "Password reset successfully. You can now sign in.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Supplier reset-password API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}