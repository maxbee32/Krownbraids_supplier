// app/api/auth/products/[id]/image/route.ts
import { NextResponse } from "next/server";

const SUPPLIER_SERVICE_URL =
  process.env.SUPPLIER_SERVICE_URL ||
  "https://5836-82-36-98-104.ngrok-free.app/supservice/api/v1/auth";

function authHeader(request: Request): string | null {
  const h = request.headers.get("authorization");
  return h && h.startsWith("Bearer ") ? h : null;
}

export async function POST(
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
    // Forward the incoming multipart body as-is
    const incoming = await request.formData();

    const res = await fetch(
      `${SUPPLIER_SERVICE_URL}/suppliers/products/${id}/image`,
      {
        method: "POST",
        headers: {
          Authorization: auth,
          "ngrok-skip-browser-warning": "true",
        },
        body: incoming,
      }
    );

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, message: text || "Failed to upload" };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Product image upload error:", err);
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
      `${SUPPLIER_SERVICE_URL}/suppliers/products/${id}/image`,
      {
        method: "DELETE",
        headers: {
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
      data = { success: false, message: text || "Failed to remove" };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Product image delete error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}