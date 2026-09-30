import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ConvexClientProvider } from "@/components/convex-client-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/standard/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// Headline font: only Heading's `display` style (Headline, Hero Card) uses it.
// Swap Geist for any next/font/google or next/font/local font; keep the variable.
const fontDisplay = Geist({
  subsets: ["latin"],
  variable: "--font-display-family",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, fontDisplay.variable, "font-sans", geist.variable)}
    >
      <body>
        <ConvexClientProvider>
          <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster />
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  )
}
