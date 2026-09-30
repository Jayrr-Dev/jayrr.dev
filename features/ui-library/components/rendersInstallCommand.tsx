"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  formatsInstallCommand,
  packageManagers,
  resolvesInstallItems,
  type PackageManager,
} from "@/features/ui-library/domain/catalog/resolvesInstallItems"

const STORAGE_KEY = "jayrr:package-manager"

/** Copy-paste shadcn add commands for a piece, per package manager. */
export function RendersInstallCommand({ pieceName }: { pieceName: string }) {
  const items = resolvesInstallItems(pieceName)
  const [manager, setManager] = usePackageManager()

  if (items.length === 0) return null

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs text-muted-foreground">Install</p>
        <Tabs
          value={manager}
          onValueChange={(value) => setManager(value as PackageManager)}
        >
          <TabsList>
            {packageManagers.map((option) => (
              <TabsTrigger key={option} value={option} className="font-mono">
                {option}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      {items.map((item) => (
        <CommandRow
          key={item.set}
          label={items.length > 1 ? item.set : null}
          command={formatsInstallCommand(manager, item.name)}
        />
      ))}
      {items.length > 1 ? (
        <p className="text-xs text-pretty text-muted-foreground">
          <span className="font-medium text-foreground">Classic</span> is the
          shadcn version, a drop-in for projects already on shadcn.{" "}
          <span className="font-medium text-foreground">Standard</span> is the
          extended version, with more variants and built-in effects.
        </p>
      ) : null}
    </div>
  )
}

function CommandRow({
  label,
  command,
}: {
  label: string | null
  command: string
}) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(timeout)
  }, [copied])

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md bg-muted py-1 pr-1 pl-3">
      {label ? (
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground capitalize">
          {label}
        </span>
      ) : null}
      <code className="min-w-0 flex-1 overflow-x-auto py-2 font-mono text-xs whitespace-pre">
        {command}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={copied ? "Copied" : "Copy command"}
        onClick={() => {
          void navigator.clipboard
            ?.writeText(command)
            .then(() => setCopied(true))
        }}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>
    </div>
  )
}

/** The chosen package manager, remembered across pieces for this viewer. */
function usePackageManager() {
  const manager = React.useSyncExternalStore(
    subscribesToManager,
    readsManager,
    () => "npm" as const
  )
  return [manager, writesManager] as const
}

const managerListeners = new Set<() => void>()

function subscribesToManager(listener: () => void) {
  managerListeners.add(listener)
  return () => managerListeners.delete(listener)
}

function readsManager(): PackageManager {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved && (packageManagers as string[]).includes(saved)) {
      return saved as PackageManager
    }
  } catch {}
  return fallbackManager
}

// Holds the choice when storage is unavailable (private window, blocked).
let fallbackManager: PackageManager = "npm"

function writesManager(next: PackageManager) {
  fallbackManager = next
  try {
    window.localStorage.setItem(STORAGE_KEY, next)
  } catch {}
  managerListeners.forEach((listener) => listener())
}
