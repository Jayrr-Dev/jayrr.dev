import * as React from "react"
import { cn } from "cn"

function Link({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="link"
      className={cn(
        "text-sm font-medium text-primary underline-offset-4 hover:underline",
        className
      )}
      {...props}
    />
  )
}

export { Link }
