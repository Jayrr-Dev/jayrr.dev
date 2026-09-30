import standardRegistry from "@/components/standard/registry.json"
import uiRegistry from "@/components/ui/registry.json"

import type { GalleryDemoSet } from "./definesGalleryCatalog"

/** Where the built registry (public/r) is served. */
export const REGISTRY_URL = "https://jayrr.dev/r"

export type PackageManager = "npm" | "pnpm" | "bun"

export const packageManagers: PackageManager[] = ["npm", "pnpm", "bun"]

const runners: Record<PackageManager, string> = {
  npm: "npx shadcn@latest add",
  pnpm: "pnpm dlx shadcn@latest add",
  bun: "bunx --bun shadcn@latest add",
}

export type InstallItem = {
  set: GalleryDemoSet
  name: string
}

/**
 * Gallery names that differ from their registry item's title. Pieces that
 * share one file (the Navigation family) point at the same item.
 */
const standardAliases: Record<string, string> = {
  "Floating Action Button": "fab",
  "Navigation Bar": "navigation",
  "Navigation Drawer": "navigation",
  "Navigation Rail": "navigation",
  Form: "form-field",
  "Standard Toolbar Count": "toolbar-count",
}

const normalizes = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-")

function findsByTitle(items: { name: string; title: string }[], title: string) {
  return items.find((item) => normalizes(item.title) === normalizes(title))
    ?.name
}

/** Registry items a gallery piece installs from, Classic first. */
export function resolvesInstallItems(pieceName: string): InstallItem[] {
  const classic = findsByTitle(uiRegistry.items, pieceName)
  const standard =
    standardAliases[pieceName] ??
    findsByTitle(standardRegistry.items, pieceName)

  return [
    ...(classic ? [{ set: "classic" as const, name: classic }] : []),
    ...(standard ? [{ set: "standard" as const, name: standard }] : []),
  ]
}

export function formatsInstallCommand(
  manager: PackageManager,
  itemName: string
) {
  return `${runners[manager]} ${REGISTRY_URL}/${itemName}.json`
}
