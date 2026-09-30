import * as React from "react"
import { cva } from "class-variance-authority"

import { Stack } from "@/components/standard/stack"

/** @deprecated Use stackVariants({ direction: "row", align: "center" }) */
const rowVariants = cva("flex items-center", {
  variants: {
    gap: {
      sm: "gap-1",
      default: "gap-2",
      lg: "gap-4",
    },
  },
  defaultVariants: {
    gap: "default",
  },
})

/** @deprecated Use <Stack direction="row" align="center"> */
function Row({
  gap = "default",
  ...props
}: Omit<React.ComponentProps<typeof Stack>, "direction">) {
  return (
    <Stack data-slot="row" direction="row" align="center" gap={gap} {...props} />
  )
}

export { Row, rowVariants }
