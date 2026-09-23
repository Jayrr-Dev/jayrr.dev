import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function RendersDemoCard({
  children,
  className,
  label,
}: {
  children: ReactNode
  className?: string
  label?: string
}) {
  return (
    <li className="w-72 only:w-full only:[&>*]:max-w-none">
      <Card className={cn("w-full justify-center", className)}>
        {label ? (
          <CardContent className="flex min-h-28 w-full flex-col items-stretch justify-center gap-3">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {label}
            </span>
            <div className="flex min-w-0 w-full flex-col items-stretch">
              {children}
            </div>
          </CardContent>
        ) : (
          <CardContent className="flex min-h-28 w-full items-center">
            {children}
          </CardContent>
        )}
      </Card>
    </li>
  )
}
