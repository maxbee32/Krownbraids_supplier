// app/api/auth/payments/marketplace/supplier/orders/[orderNumber]/fulfil/route.ts
import { NextRequest, NextResponse } from "next/server";

const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL ||
  "https://9125-82-36-98-104.ngrok-free.app/pservice";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await context.params;
    const auth = request.headers.get("authorization");
    if (!auth) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const body = await request.text();

    const res = await fetch(
      `${PAYMENT_SERVICE_URL}/api/v1/auth/payments/marketplace/supplier/orders/${encodeURIComponent(
        orderNumber
      )}/fulfil`,
      {
        method: "PATCH",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body,
      }
    );

    const out = await res.text();
    return new NextResponse(out, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[supplier-fulfil] proxy error:", err);
    return NextResponse.json(
      { error: "Could not reach payment service" },
      { status: 502 }
    );
  }
}