import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  // The MCP route reads the built registry and docs from disk at request time.
  outputFileTracingIncludes: {
    "/mcp": ["./public/r/*.json", "./docs/component-conventions.md"],
  },
}

export default nextConfig
