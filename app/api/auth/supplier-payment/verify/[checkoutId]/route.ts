// app/api/auth/supplier-payment/verify/[checkoutId]/route.ts
import { NextResponse } from "next/server";

const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL ||
  "https://58bb-82-36-98-104.ngrok-free.app/pservice";

export async function GET(
  request: Request,
  context: { params: Promise<{ checkoutId: string }> }
) {
  try {
    const params = await context.params;
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("Verifying supplier payment:", params.checkoutId);

    const backendUrl = `${PAYMENT_SERVICE_URL}/api/v1/auth/supplier-payment/verify/${params.checkoutId}`;
    console.log("Calling backend:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authHeader,
        "ngrok-skip-browser-warning": "true",
      },
    });

    const rawResponse = await response.text();
    console.log("Backend status:", response.status);
    console.log("Raw response:", rawResponse);

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch {
      data = { message: rawResponse || "Verification failed" };
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Payment verification failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}