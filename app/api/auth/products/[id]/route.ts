// app/api/auth/products/[id]/route.ts
import { NextResponse } from "next/server";

const SUPPLIER_SERVICE_URL =
  process.env.SUPPLIER_SERVICE_URL ||
  "https://58bb-82-36-98-104.ngrok-free.app/supservice/api/v1/auth";

function authHeader(request: Request): string | null {
  const h = request.headers.get("authorization");
  return h && h.startsWith("Bearer ") ? h : null;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = authHeader(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const res = await fetch(
      `${SUPPLIER_SERVICE_URL}/suppliers/products/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: auth,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(body),
      }
    );

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, message: text || "Failed to update product" };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Product PUT error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = authHeader(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(
      `${SUPPLIER_SERVICE_URL}/suppliers/products/${id}`,
      {
        method: "DELETE",
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
      data = { success: false, message: text || "Failed to delete product" };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Product DELETE error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}