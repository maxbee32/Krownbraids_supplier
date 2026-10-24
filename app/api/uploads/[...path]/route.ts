// app/api/uploads/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.SUPPLIER_SERVICE_URL ||
  "https://899a-82-36-98-104.ngrok-free.app/supservice";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const filePath = path.join("/");

    const url = `${BACKEND_URL}/api/v1/auth/images/suppliers/${filePath}`;
    console.log("[img] proxying:", url);

    const backendResponse = await fetch(url, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        "User-Agent": "krownbraids-server/1.0",
      },
      cache: "no-store",
    });

    console.log("[img] status:", backendResponse.status);

    if (!backendResponse.ok) {
      return new NextResponse(null, { status: backendResponse.status });
    }

    const contentType =
      backendResponse.headers.get("content-type") || "image/jpeg";
    const buffer = await backendResponse.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, immutable",
      },
    });
  } catch (error) {
    console.error("[img] proxy error:", error);
    return new NextResponse(null, { status: 500 });
  }
}