import { NextResponse } from "next/server";

const SUPPLIER_SERVICE_URL =
  process.env.SUPPLIER_SERVICE_URL ||
  "https://58bb-82-36-98-104.ngrok-free.app/supservice/api/v1/auth";

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(
      `${SUPPLIER_SERVICE_URL}/suppliers/onboarding/plan`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(body),
      }
    );

    const rawResponse = await response.text();
    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch {
      data = { message: rawResponse || "Failed to save plan" };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Plan step error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
