// app/api/auth/export-data/route.ts
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
    `${SUPPLIER_SERVICE_URL}/api/v1/auth/suppliers/me/export-data`,
    {
      headers: {
        Authorization: auth,
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(
      { message: data.message || "Failed to export data" },
      { status: res.status }
    );
  }

  // Stream the JSON through as a downloadable file
  const blob = await res.blob();
  const filename = `krownbraids-data-export-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}