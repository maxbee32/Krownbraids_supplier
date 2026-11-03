// app/api/auth/supplier-payment/create-stripe-session/route.ts
import { NextResponse } from "next/server";

const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL ||
  "https://9277-82-36-98-104.ngrok-free.app/pservice";

export async function POST(request: Request) {
  try {
    console.log("=== Supplier Stripe Session API Route ===");

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Stripe session request:", body);

    // ─────────────────────────────────────────
    // Validate required fields
    // ─────────────────────────────────────────
    if (!body.planId) {
      return NextResponse.json(
        { message: "Plan ID is required" },
        { status: 400 }
      );
    }

    if (!body.supplierId) {
      console.error("❌ supplierId is missing");
      return NextResponse.json(
        { message: "Supplier ID is required" },
        { status: 400 }
      );
    }

    const backendUrl = `${PAYMENT_SERVICE_URL}/api/v1/auth/stripe/create-embedded-session`;
    console.log("Calling backend:", backendUrl);

    // Force the userType so this route can only ever create supplier sessions
    const payload = {
      userType: "SUPPLIER",
      supplierId: body.supplierId,
      planId: body.planId,
      billingCycle: body.billingCycle || "monthly",
      paymentType: "SUBSCRIPTION",
      email: body.email,
    };

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(payload),
    });

    const rawResponse = await response.text();
    console.log("Backend status:", response.status);
    console.log("Raw response:", rawResponse);

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch {
      data = { message: rawResponse || "Failed to create Stripe session" };
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: data.error || data.message || "Failed to create session" },
        { status: response.status }
      );
    }

    // Returns: { clientSecret: "cs_test_...", sessionId: "cs_test_..." }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Stripe create session error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}