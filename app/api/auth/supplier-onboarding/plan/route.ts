// app/api/auth/supplier-onboarding/plan/route.ts
import { NextResponse } from "next/server";

const SUPPLIER_SERVICE_URL =
  process.env.SUPPLIER_SERVICE_URL ||
  "https://5836-82-36-98-104.ngrok-free.app/supservice/api/v1/auth";

export async function PUT(request: Request) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const res = await fetch(
      `${SUPPLIER_SERVICE_URL}/suppliers/onboarding/plan`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: auth,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(body),
      }
    );

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, message: text || "Failed to save plan" };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Plan step error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}