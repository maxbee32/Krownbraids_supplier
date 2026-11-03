import { NextRequest, NextResponse } from "next/server";

const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL ||
  "https://daba-82-36-98-104.ngrok-free.app/pservice";

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const qs = request.nextUrl.searchParams.toString();

    const res = await fetch(
      `${PAYMENT_SERVICE_URL}/api/v1/auth/payments/marketplace/supplier/orders${
        qs ? `?${qs}` : ""
      }`,
      {
        headers: {
          Authorization: auth,
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[supplier-orders] proxy error:", err);
    return NextResponse.json(
      { error: "Could not reach payment service" },
      { status: 502 }
    );
  }
}