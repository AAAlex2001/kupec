import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

loadEnvConfig(path.join(process.cwd(), ".."));

const backendOrigin = (process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8000/api").replace(
  /\/api$/,
  "",
);

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    qualities: [75, 95],
  },
  sassOptions: {
    loadPaths: [path.join(process.cwd(), "src")],
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${backendOrigin}/api/:path*` },
      { source: "/media/:path*", destination: `${backendOrigin}/media/:path*` },
    ];
  },
};

export default nextConfig;
