// app/api/auth/onboarding/complete-trial/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://899a-82-36-98-104.ngrok-free.app/supservice/api/v1/auth";

export async function PUT(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(
      `${BACKEND_URL}/suppliers/onboarding/complete-trial`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: auth,
          "ngrok-skip-browser-warning": "true",
        },
        cache: "no-store",
      }
    );

    const raw = await res.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { success: false, message: "Non-JSON response" };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("complete-trial proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}