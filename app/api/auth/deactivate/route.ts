// app/api/auth/deactivate/route.ts
import { NextResponse } from "next/server";

const SUPPLIER_SERVICE_URL =
  process.env.SUPPLIER_SERVICE_URL ||
  "https://5f31-82-36-98-104.ngrok-free.app/supservice";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(
    `${SUPPLIER_SERVICE_URL}/api/v1/auth/suppliers/me/deactivate`,
    {
      method: "PATCH",
      headers: {
        Authorization: auth,
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    }
  );

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}