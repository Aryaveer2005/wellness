import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Location (the "near me" search) and microphone (chat voice mode) for this site only; no camera.
  { key: "Permissions-Policy", value: "geolocation=(self), microphone=(self), camera=(), payment=()" },
];

const nextConfig: NextConfig = {
  // gRPC (voice) stays a plain Node dependency on the server — never bundled.
  serverExternalPackages: ["@grpc/grpc-js", "@grpc/proto-loader"],
  // Ship the Riva voice protocol files with the server code.
  outputFileTracingIncludes: {
    "/api/tts": ["./src/lib/server/proto/**/*"],
    "/api/stt": ["./src/lib/server/proto/**/*"],
  },
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
