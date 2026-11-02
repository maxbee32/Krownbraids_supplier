// app/api/auth/notification-preferences/route.ts
import { NextResponse } from "next/server";

const SUPPLIER_SERVICE_URL =
  process.env.SUPPLIER_SERVICE_URL ||
  "https://4ef0-82-36-98-104.ngrok-free.app /supservice";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(
    `${SUPPLIER_SERVICE_URL}/api/v1/auth/suppliers/me/notification-preferences`,
    {
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

export async function PUT(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  const res = await fetch(
    `${SUPPLIER_SERVICE_URL}/api/v1/auth/suppliers/me/notification-preferences`,
    {
      method: "PUT",
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