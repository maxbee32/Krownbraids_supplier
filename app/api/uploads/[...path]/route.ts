// app/api/uploads/[...path]/route.ts
import { NextResponse } from "next/server";

// Direct tunnel to the supplier service (bypasses the gateway, serves /uploads/**)
const SUPPLIER_SERVICE_ROOT = "https://5783-82-36-98-104.ngrok-free.app";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const filePath = path.join("/");
  const targetUrl = `${SUPPLIER_SERVICE_ROOT}/uploads/${filePath}`;

  console.log("[img] target URL:", targetUrl);

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        Accept: "image/*,*/*",
      },
      redirect: "follow",
    });

    console.log("[img] upstream status:", upstream.status);
    console.log("[img] upstream content-type:", upstream.headers.get("content-type"));

    if (!upstream.ok) {
      const body = await upstream.text().catch(() => "");
      console.log("[img] error body:", body.slice(0, 400));
      return new NextResponse(null, { status: upstream.status });
    }

    const buffer = await upstream.arrayBuffer();
    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[img] fetch error:", err);
    return new NextResponse(null, { status: 502 });
  }
}