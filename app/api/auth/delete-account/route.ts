// app/api/auth/delete-account/route.ts
import { NextResponse } from "next/server";

const SUPPLIER_SERVICE_URL =
  process.env.SUPPLIER_SERVICE_URL ||
  "https://9125-82-36-98-104.ngrok-free.app/supservice";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  const res = await fetch(
    `${SUPPLIER_SERVICE_URL}/api/v1/auth/suppliers/me/delete`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}