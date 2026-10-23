import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"

import { createsRegistryMcpServer } from "@/features/registry-mcp/createsRegistryMcpServer"

/** Browser origins allowed to call the endpoint. Server-side clients send none. */
const allowsOrigin = (origin: string) => {
  try {
    const { hostname } = new URL(origin)

    return (
      hostname === "jayrr.dev" ||
      hostname.endsWith(".jayrr.dev") ||
      hostname === "localhost" ||
      hostname === "127.0.0.1"
    )
  } catch {
    return false
  }
}

const jsonRpcError = (status: number, message: string) =>
  Response.json(
    { jsonrpc: "2.0", error: { code: -32000, message }, id: null },
    { status, headers: status === 405 ? { Allow: "POST" } : undefined }
  )

// Stateless Streamable HTTP: a fresh server and transport per request, plain
// JSON responses, no sessions. Fits serverless, where instances don't share
// memory.
export async function POST(request: Request) {
  const origin = request.headers.get("origin")

  // The spec requires rejecting unknown origins (DNS rebinding protection).
  if (origin && !allowsOrigin(origin)) {
    return jsonRpcError(403, "Origin not allowed")
  }

  const server = createsRegistryMcpServer()
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })

  await server.connect(transport)

  try {
    return await transport.handleRequest(request)
  } finally {
    await server.close()
  }
}

// No server-initiated stream and no sessions to end.
export function GET() {
  return jsonRpcError(405, "Method not allowed")
}

export function DELETE() {
  return jsonRpcError(405, "Method not allowed")
}
