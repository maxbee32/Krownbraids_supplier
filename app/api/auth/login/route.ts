// app/api/auth/login/route.ts
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://5836-82-36-98-104.ngrok-free.app/supservice/api/v1/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("=== Supplier Login API Route ===");
    console.log("Login attempt for:", body.email);

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // ✅ Call your supplier-service login endpoint
    const backendUrl = `${BACKEND_URL}/suppliers/login`;
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
        password: body.password,
      }),
    });

    const rawResponse = await response.text();
    console.log("Backend status:", response.status);
    console.log("Raw backend response:", rawResponse);

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch {
      data = { message: rawResponse || "Login failed" };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          message: data.message || data.error || "Invalid email or password",
          ...data,
        },
        { status: response.status }
      );
    }

    // ✅ Backend returns: { success, message, data: { token, userId, role, ... } }
    // Extract the auth data from ApiResponseDTO wrapper
    const authData = data.data || data;

    return NextResponse.json(
      {
        token: authData.token,
        userId: authData.userId,
        role: authData.role,
        message: authData.message || data.message || "Login successful",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Supplier login API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}