import { readFile } from "fs/promises"
import path from "path"

import {
  galleryComponents,
  toPieceSlug,
  type GalleryTier,
} from "@/features/ui-library/domain/catalog/definesGalleryCatalog"
import {
  formatsInstallCommand,
  resolvesInstallItems,
} from "@/features/ui-library/domain/catalog/resolvesInstallItems"
import registry from "@/public/r/registry.json"

const SITE_URL = "https://jayrr.dev"

/** Which part of the library an item ships from, read from its file path. */
export type RegistrySet = "classic" | "standard" | "hook" | "lib"

export type RegistryEntry = {
  name: string
  title: string
  description: string
  type: string
  set: RegistrySet
  tier?: GalleryTier
  galleryUrl?: string
  dependencies: string[]
  registryDependencies: string[]
  files: string[]
}

type RegistryItem = (typeof registry.items)[number] & {
  dependencies?: string[]
  registryDependencies?: string[]
}

function setFor(filePath: string): RegistrySet {
  if (filePath.startsWith("components/ui/")) return "classic"
  if (filePath.startsWith("components/standard/")) return "standard"
  if (filePath.startsWith("hooks/")) return "hook"
  return "lib"
}

/** Registry item name to the gallery piece that demos it. */
function mapsGalleryPieces() {
  const pieces = new Map<string, { tier: GalleryTier; slug: string }>()

  for (const component of galleryComponents) {
    for (const item of resolvesInstallItems(component.name)) {
      if (!pieces.has(item.name)) {
        pieces.set(item.name, {
          tier: component.tier,
          slug: toPieceSlug(component.name),
        })
      }
    }
  }

  return pieces
}

function buildsEntries(): RegistryEntry[] {
  const pieces = mapsGalleryPieces()

  return (registry.items as RegistryItem[]).map((item) => {
    const piece = pieces.get(item.name)

    return {
      name: item.name,
      title: item.title,
      description: item.description,
      type: item.type,
      set: setFor(item.files?.[0]?.path ?? ""),
      tier: piece?.tier,
      galleryUrl: piece ? `${SITE_URL}/gallery/${piece.slug}` : undefined,
      dependencies: item.dependencies ?? [],
      registryDependencies: item.registryDependencies ?? [],
      files: (item.files ?? []).map((file) => file.path),
    }
  })
}

export const registryEntries = buildsEntries()

const entriesByName = new Map(
  registryEntries.map((entry) => [entry.name, entry])
)

export function findsEntry(name: string) {
  return entriesByName.get(name.trim().toLowerCase())
}

export function installCommandFor(name: string) {
  return formatsInstallCommand("npm", name)
}

const tokenizes = (value: string) =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)

/** Ranks name and title hits above description hits; drops items with none. */
export function searchesEntries(query: string, entries = registryEntries) {
  const tokens = tokenizes(query)

  if (tokens.length === 0) {
    return entries
  }

  const scored = entries.map((entry) => {
    const name = entry.name
    const title = entry.title.toLowerCase()
    const description = entry.description.toLowerCase()
    let score = name === tokens.join("-") ? 100 : 0

    for (const token of tokens) {
      if (name.includes(token)) score += 10
      if (title.includes(token)) score += 8
      if (description.includes(token)) score += 2
    }

    return { entry, score }
  })

  return scored
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name)
    )
    .map(({ entry }) => entry)
}

function editDistance(a: string, b: string) {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index)

  for (let i = 1; i <= a.length; i++) {
    const current = [i]

    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
    }

    previous = current
  }

  return previous[b.length]
}

/**
 * Closest names for an unknown one, for "did you mean" errors: near typos
 * first, then keyword matches.
 */
export function suggestsNames(name: string, limit = 5) {
  const wanted = name.trim().toLowerCase()
  const typos = registryEntries
    .map((entry) => ({
      name: entry.name,
      distance: editDistance(wanted, entry.name),
    }))
    .filter(({ distance }) => distance <= 2)
    .sort((a, b) => a.distance - b.distance)
    .map((match) => match.name)
  const keywords = searchesEntries(wanted.replace(/-/g, " ")).map(
    (entry) => entry.name
  )

  return [...new Set([...typos, ...keywords])].slice(0, limit)
}

/** Source files of a known item, read from the built registry in public/r. */
export async function readsItemSource(entry: RegistryEntry) {
  const file = path.join(process.cwd(), "public", "r", `${entry.name}.json`)
  const item = JSON.parse(await readFile(file, "utf8")) as {
    files: { path: string; content: string }[]
  }

  return item.files.map(({ path, content }) => ({ path, content }))
}

export async function readsConventions() {
  return readFile(
    path.join(process.cwd(), "docs", "component-conventions.md"),
    "utf8"
  )
}
