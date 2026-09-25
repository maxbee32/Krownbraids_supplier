// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Dev — local supplier service
      {
        protocol: "http",
        hostname: "localhost",
        port: "8085",
        pathname: "/uploads/**",
      },
      // Dev — Docker internal network name (if you render server-side)
      {
        protocol: "http",
        hostname: "krownbraids-supplier-service",
        port: "8085",
        pathname: "/uploads/**",
      },
      // Dev — ngrok tunnel
      {
        protocol: "https",
        hostname: "5836-82-36-98-104.ngrok-free.app",
        pathname: "/supservice/uploads/**",
      },
      // Production — swap for your real domain when you deploy
      // {
      //   protocol: "https",
      //   hostname: "api.krownbraids.com",
      //   pathname: "/uploads/**",
      // },
    ],
  },
};

export default nextConfig;