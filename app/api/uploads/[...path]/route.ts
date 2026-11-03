// // app/api/uploads/[...path]/route.ts
// import { NextRequest, NextResponse } from "next/server";

// const BACKEND_URL =
//   process.env.SUPPLIER_SERVICE_URL ||
//   "https://9277-82-36-98-104.ngrok-free.app /supservice";

// export async function GET(
//   request: NextRequest,
//   context: { params: Promise<{ path: string[] }> }
// ) {
//   try {
//     const { path } = await context.params;
//     const filePath = path.join("/");

//     const url = `${BACKEND_URL}/api/v1/auth/images/suppliers/${filePath}`;
//     console.log("[img] proxying:", url);

//     const backendResponse = await fetch(url, {
//       headers: {
//         "ngrok-skip-browser-warning": "true",
//         "User-Agent": "krownbraids-server/1.0",
//       },
//       cache: "no-store",
//     });

//     console.log("[img] status:", backendResponse.status);

//     if (!backendResponse.ok) {
//       return new NextResponse(null, { status: backendResponse.status });
//     }

//     const contentType =
//       backendResponse.headers.get("content-type") || "image/jpeg";
//     const buffer = await backendResponse.arrayBuffer();

//     return new NextResponse(buffer, {
//       status: 200,
//       headers: {
//         "Content-Type": contentType,
//         "Cache-Control": "public, max-age=3600, immutable",
//       },
//     });
//   } catch (error) {
//     console.error("[img] proxy error:", error);
//     return new NextResponse(null, { status: 500 });
//   }
// }


// app/api/uploads/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.SUPPLIER_SERVICE_URL ||
  "https://9277-82-36-98-104.ngrok-free.app/supservice";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const joined = path.join("/");

    // The supplier service saves to `uploads/products/{supplierId}/{file}` and
    // exposes it under either of these two routes. Try both.
    const candidates: string[] = [];

    if (joined.startsWith("products/")) {
      // path = ["products", supplierId, file]
      candidates.push(
        `${BACKEND_URL}/api/v1/auth/images/suppliers/${joined}`
      );
    } else {
      // path = [supplierId, file]  ← orders thumbnails look like this
      candidates.push(
        `${BACKEND_URL}/api/v1/auth/images/suppliers/products/${joined}`,
        `${BACKEND_URL}/api/v1/auth/images/suppliers/${joined}`
      );
    }

    for (const url of candidates) {
      console.log("[img] trying:", url);

      const res = await fetch(url, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "User-Agent": "krownbraids-server/1.0",
        },
        cache: "no-store",
      });

      console.log("[img] status:", res.status, url);

      if (!res.ok) continue;

      const contentType = res.headers.get("content-type") || "image/jpeg";
      const buffer = await res.arrayBuffer();

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600, immutable",
        },
      });
    }

    console.error("[img] all candidates failed for path:", joined);
    return new NextResponse(null, { status: 404 });
  } catch (error) {
    console.error("[img] proxy error:", error);
    return new NextResponse(null, { status: 500 });
  }
}