import * as React from "react"

import { Badge } from "@/components/standard/badge"

/** @deprecated Use <Badge size="lg"> */
function BadgePill(props: React.ComponentProps<typeof Badge>) {
  return <Badge data-slot="badge-pill" size="lg" {...props} />
}

/** @deprecated Use <Badge shape="circle"> */
function CircleBadge(props: React.ComponentProps<"span">) {
  return <Badge data-slot="circle-badge" shape="circle" {...props} />
}

/** @deprecated Use <Badge leading> */
function BadgeIcon({
  children,
  leading,
  ...props
}: React.ComponentProps<typeof Badge>) {
  // The icon used to be the first child; lift it into `leading`.
  const [first, ...rest] = React.Children.toArray(children)
  const lifts = leading === undefined && React.isValidElement(first)

  return (
    <Badge data-slot="badge-icon" leading={lifts ? first : leading} {...props}>
      {lifts ? rest : children}
    </Badge>
  )
}

export { BadgeIcon, BadgePill, CircleBadge }
