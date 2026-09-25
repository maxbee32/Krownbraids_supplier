import { NextResponse } from "next/server";

const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL ||
  "https://5836-82-36-98-104.ngrok-free.app/paymentservice/api/v1";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(
      `${PAYMENT_SERVICE_URL}/payments/my-transactions/summary`,
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
      data = { success: false, message: text || "Failed to load summary" };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Transactions summary error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}