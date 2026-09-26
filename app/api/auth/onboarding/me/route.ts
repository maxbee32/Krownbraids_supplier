// app/api/auth/onboarding/me/route.ts
import { NextResponse } from "next/server";

const SUPPLIER_SERVICE_URL =
  process.env.SUPPLIER_SERVICE_URL ||
  "https://58bb-82-36-98-104.ngrok-free.app/supservice/api/v1/auth";

export async function GET(request: Request) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const res = await fetch(
      `${SUPPLIER_SERVICE_URL}/suppliers/onboarding/me`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: auth,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, message: text || "Failed to fetch profile" };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Profile GET error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}