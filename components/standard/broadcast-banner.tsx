import * as React from "react"

import { Alert } from "@/components/standard/alert"

/** @deprecated Use <Alert tone="broadcast" layout="banner"> */
function BroadcastBanner({
  title,
  ...props
}: Omit<React.ComponentProps<typeof Alert>, "title"> & { title: string }) {
  return (
    <Alert
      data-slot="broadcast-banner"
      tone="broadcast"
      layout="banner"
      title={title}
      {...props}
    />
  )
}

export { BroadcastBanner }
