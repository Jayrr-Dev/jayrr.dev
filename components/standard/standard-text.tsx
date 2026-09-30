import * as React from "react"

import { Paragraph } from "@/components/standard/paragraph"

/** @deprecated Use <Paragraph size="sm"> */
function StandardText(props: React.ComponentProps<"p">) {
  return <Paragraph data-slot="standard-text" size="sm" {...props} />
}

export { StandardText }
