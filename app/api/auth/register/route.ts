import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://5836-82-36-98-104.ngrok-free.app/supservice/api/v1/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("=== Supplier Register API Route ===");

    // Validate required fields
    if (
      !body.fullName ||
      !body.email ||
      !body.phone ||
      !body.password
    ) {
      return NextResponse.json(
        {
          message: "Full name, email, phone and password are required",
        },
        { status: 400 }
      );
    }

    // ✅ Call your auth-service supplier register endpoint
    const backendUrl = `${BACKEND_URL}/suppliers/register`;
    console.log("Calling backend:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
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
      data = { message: rawResponse || "Registration failed" };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            data.message || data.error || "Registration failed",
          ...data,
        },
        { status: response.status }
      );
    }

    // ✅ Backend returns: { success, message, data: { token, userId, role, message } }
    // Extract the token from ApiResponseDTO wrapper
    const authData = data.data || data;

    return NextResponse.json(
      {
        token: authData.token,
        userId: authData.userId,
        role: authData.role,
        message: authData.message || "Registration successful",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Supplier register API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}