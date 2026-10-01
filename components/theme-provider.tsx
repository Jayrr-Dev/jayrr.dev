"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * next-themes inlines a script that sets the theme before first paint. It
 * only needs to run from the server HTML; on the client, a non-executable
 * type keeps React 19 from warning about rendering a script tag.
 */
const scriptProps =
  typeof window === "undefined"
    ? undefined
    : ({ type: "application/json" } as const)

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      scriptProps={scriptProps}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { ThemeProvider }
