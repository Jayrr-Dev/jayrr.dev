#!/usr/bin/env node
/**
 * Validates the gallery catalog and checks that every piece page renders.
 *
 *   node scripts/checksGalleryPages.mjs --port 3200 [--pieces "Button,Badge"]
 *
 * Catalog checks (always run):
 * - every entry's `type`, `canonical` and `tier` resolve to a category in
 *   galleryTypes.json
 * - names are unique
 * - every entry with "standard" in `demos` has a key in
 *   definesStandardPieceDemos.ts
 * - every entry has a description under its tier in shortDescriptions.json,
 *   carries no `description` of its own, and that file names no other pieces
 *
 * Page checks: GETs /gallery/<slug> for each (or each listed) piece in turn
 * against a running dev server. Exits non-zero on any failure.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const catalogDir = join(root, "features/ui-library/domain/catalog")
const pieceDemosFile = join(
  root,
  "features/standard-library/components/demos/definesStandardPieceDemos.ts"
)

function readsArgs(argv) {
  const args = { port: 3200, pieces: null }
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (flag === "--port") {
      args.port = Number(value)
      index += 1
    } else if (flag === "--pieces") {
      args.pieces = value
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
      index += 1
    }
  }
  return args
}

function toPieceSlug(name) {
  return name.toLowerCase().replace(/\s+/g, "-")
}

function readsJson(file) {
  return JSON.parse(readFileSync(join(catalogDir, file), "utf8"))
}

/** Returns one message per catalog problem. */
function validatesCatalog(components, types, descriptions) {
  const problems = []
  const known = new Set(
    types.flatMap((bucket) =>
      (bucket.children ?? []).map((category) => `${bucket.id}/${category.id}`)
    )
  )
  const regrouping = types.filter(
    (bucket) => bucket.groupBy === "canonical" || bucket.groupBy === "tier"
  )

  let pieceDemoSource = ""
  try {
    pieceDemoSource = readFileSync(pieceDemosFile, "utf8")
  } catch {
    problems.push(`missing ${pieceDemosFile}`)
  }

  const seen = new Set()
  for (const component of components) {
    const { name } = component
    if (seen.has(name)) {
      problems.push(`duplicate name "${name}"`)
    }
    seen.add(name)

    if (!known.has(component.type)) {
      problems.push(`${name}: unknown type "${component.type}"`)
    }
    for (const bucket of regrouping) {
      const path = `${bucket.id}/${component[bucket.groupBy]}`
      if (!known.has(path)) {
        problems.push(`${name}: unknown ${bucket.groupBy} "${path}"`)
      }
    }

    if (pieceDemoSource && (component.demos ?? []).includes("standard")) {
      // Quoted ("Button Icon":) or, for one-word names, bare (Button:).
      const key = new RegExp(
        `(["'])${escapesRegExp(name)}\\1\\s*:|^\\s*${escapesRegExp(name)}\\s*:`,
        "m"
      )
      if (!key.test(pieceDemoSource)) {
        problems.push(`${name}: no key in definesStandardPieceDemos.ts`)
      }
    }

    if (!descriptions[component.tier]?.[name]) {
      problems.push(`${name}: no ${component.tier} entry in shortDescriptions.json`)
    }
    if ("description" in component) {
      problems.push(`${name}: description belongs in shortDescriptions.json`)
    }
  }

  for (const [tier, entries] of Object.entries(descriptions)) {
    for (const name of Object.keys(entries)) {
      if (!components.some((c) => c.name === name && c.tier === tier)) {
        problems.push(`shortDescriptions.json: no ${tier} piece "${name}"`)
      }
    }
  }
  return problems
}

function escapesRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

async function checksPages(names, port) {
  const failures = []
  for (const name of names) {
    const url = `http://localhost:${port}/gallery/${toPieceSlug(name)}`
    try {
      const response = await fetch(url)
      await response.arrayBuffer()
      if (response.status !== 200) {
        failures.push(`${name}: ${response.status} ${url}`)
      }
    } catch (error) {
      failures.push(`${name}: ${error.message} ${url}`)
    }
  }
  return failures
}

const args = readsArgs(process.argv.slice(2))
const components = readsJson("galleryComponents.json")
const types = readsJson("galleryTypes.json")
const descriptions = readsJson("shortDescriptions.json")

const catalogProblems = validatesCatalog(components, types, descriptions)
for (const problem of catalogProblems) {
  console.error(`catalog: ${problem}`)
}

const names = args.pieces ?? components.map((component) => component.name)
const unknown = names.filter(
  (name) => !components.some((component) => component.name === name)
)
for (const name of unknown) {
  console.error(`pieces: "${name}" is not in galleryComponents.json`)
}

const pageFailures = await checksPages(names, args.port)
for (const failure of pageFailures) {
  console.error(`page: ${failure}`)
}

const failed = catalogProblems.length + unknown.length + pageFailures.length
console.log(
  `${components.length} catalog entries, ${names.length} pages checked, ${failed} failure(s)`
)
process.exit(failed > 0 ? 1 : 0)
