import { NextResponse } from "next/server";

const SUPPLIER_SERVICE_URL =
  process.env.SUPPLIER_SERVICE_URL ||
  "https://5836-82-36-98-104.ngrok-free.app/supservice/api/v1/auth";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${SUPPLIER_SERVICE_URL}/suppliers/onboarding/me`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: authHeader,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, message: text || "Failed to fetch profile" };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Onboarding /me error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}