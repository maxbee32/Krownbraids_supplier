// app/api/auth/supplier-payment/initialize/route.ts
import { NextResponse } from "next/server";

const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL ||
  "https://5836-82-36-98-104.ngrok-free.app/pservice";

export async function POST(request: Request) {
  try {
    console.log("=== Supplier Payment Initialize API Route ===");

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Initialize request:", body);

    // ─────────────────────────────────────────
    // Validate required fields
    // ─────────────────────────────────────────
    if (!body.planId || !body.billingCycle) {
      return NextResponse.json(
        { message: "Plan ID and billing cycle are required" },
        { status: 400 }
      );
    }

    if (!body.supplierId) {
      console.error("❌ supplierId is missing from payment init request");
      return NextResponse.json(
        {
          message:
            "Supplier ID is required. Please log in again if the problem persists.",
        },
        { status: 400 }
      );
    }

    const backendUrl = `${PAYMENT_SERVICE_URL}/api/v1/auth/supplier-payment/initialize`;
    console.log("Calling backend:", backendUrl);
    console.log("Forwarding body:", JSON.stringify(body));

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader,
        "ngrok-skip-browser-warning": "true",
      },
      // ✅ Forward the entire body — including supplierId
      body: JSON.stringify(body),
    });

    const rawResponse = await response.text();
    console.log("Backend status:", response.status);
    console.log("Raw response:", rawResponse);

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch {
      data = { message: rawResponse || "Failed to initialize payment" };
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to initialize payment" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Supplier payment init error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}