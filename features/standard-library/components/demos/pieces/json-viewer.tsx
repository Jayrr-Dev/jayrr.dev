"use client"

import { JsonViewer } from "@/components/standard/json-viewer"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

const order = {
  id: "ord_7Q2K",
  status: "shipped",
  total: 128.4,
  paid: true,
  coupon: null,
  customer: {
    name: "Ada Lovelace",
    email: "ada@example.com",
    address: {
      city: "London",
      postcode: "W1",
      geo: { lat: 51.51, lng: -0.13 },
    },
  },
  items: [
    { sku: "KB-01", name: "Keyboard", qty: 1, price: 89 },
    { sku: "MS-04", name: "Mouse", qty: 2, price: 19.7 },
  ],
  metadata: '{"source":"web","campaign":{"id":42,"channel":"email"}}',
  notes: [],
}

export function RendersJsonViewerDemo() {
  return (
    <>
      <RendersDemoCard className="w-full max-w-xl">
        <JsonViewer data={order} title="GET /api/orders/ord_7Q2K" />
      </RendersDemoCard>
      <RendersDemoCard
        label="editable · expandDepth 1"
        className="w-full max-w-xl"
      >
        <JsonViewer
          editable
          expandDepth={1}
          defaultValue={JSON.stringify(
            {
              ok: true,
              items: [1, 2, 3],
              next: { cursor: "c_91", more: true },
            },
            null,
            2
          )}
          title="Paste JSON"
        />
      </RendersDemoCard>
    </>
  )
}
