import fs from "fs"
import path from "path"

const skipPkgs = new Set(["react", "react-dom"])

const uiFiles = fs
  .readdirSync("components/ui")
  .filter((file) => file.endsWith(".tsx"))
  .sort()

const uiNames = new Set(uiFiles.map((file) => file.replace(/\.tsx$/, "")))

// Standard files that share a name with a Classic file publish as standard-<name>.
// When that name already belongs to a Standard file of its own (table.tsx vs
// standard-table.tsx), the override below keeps both names unique and stable.
const STANDARD_NAME_OVERRIDES = {
  table: "standard-simple-table",
}

function standardNameFor(base) {
  if (STANDARD_NAME_OVERRIDES[base]) {
    return STANDARD_NAME_OVERRIDES[base]
  }

  return uiNames.has(base) ? `standard-${base}` : base
}

// Hand-written fields (descriptions, css, cssVars) survive a rebuild.
function readsEntries(file) {
  if (!fs.existsSync(file)) {
    return new Map()
  }

  const { items } = JSON.parse(fs.readFileSync(file, "utf8"))

  return new Map(items.map((entry) => [entry.name, entry]))
}

function titleFrom(name) {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// A Standard import with only a .ts file (e.g. data-grid-model.ts) is a helper,
// not a registry item, so it ships as an extra file of the item importing it.
// So does anything in a subfolder (data-grid/cell.tsx): the parts of one item.
function standardHelperFor(spec) {
  const rel = spec.slice("@/components/standard/".length)

  if (rel.includes("/")) {
    const part = [".tsx", ".ts"]
      .map((ext) => path.join("components/standard", `${rel}${ext}`))
      .find((file) => fs.existsSync(file))

    return part ?? null
  }

  const base = path.basename(spec).replace(/\.(tsx|ts)$/, "")
  const helper = path.join("components/standard", `${base}.ts`)
  const isItem = fs.existsSync(path.join("components/standard", `${base}.tsx`))

  return !isItem && fs.existsSync(helper) ? helper : null
}

// Prose styles live in typeset.css, which has no import to follow, so a file
// that puts the `typeset` class on an element depends on the typeset item.
// Comments are stripped first so prose mentioning typeset does not count.
function usesTypeset(text) {
  const code = text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(?<!:)\/\/.*$/gm, "")

  return /(?<![\w-])typeset(?![\w.-])/.test(code)
}

// The tone colors (success, warning, info) are theme tokens that stock shadcn
// themes don't declare, so a file using one depends on the standard-tokens item
// that ships them as cssVars.
const TONE_TOKENS = {
  theme: {
    "color-success": "var(--success)",
    "color-success-foreground": "var(--success-foreground)",
    "color-warning": "var(--warning)",
    "color-warning-foreground": "var(--warning-foreground)",
    "color-info": "var(--info)",
    "color-info-foreground": "var(--info-foreground)",
  },
  light: {
    success: "oklch(0.508 0.118 165.612)",
    "success-foreground": "oklch(0.985 0 0)",
    warning: "oklch(0.555 0.163 48.998)",
    "warning-foreground": "oklch(0.985 0 0)",
    info: "oklch(0.5 0.134 242.749)",
    "info-foreground": "oklch(0.985 0 0)",
  },
  dark: {
    success: "oklch(0.765 0.177 163.223)",
    "success-foreground": "oklch(0.205 0 0)",
    warning: "oklch(0.828 0.189 84.429)",
    "warning-foreground": "oklch(0.205 0 0)",
    info: "oklch(0.746 0.16 232.661)",
    "info-foreground": "oklch(0.205 0 0)",
  },
}

function usesToneTokens(text) {
  return /(?<![\w-])[a-z]+(?:-[a-z]+)*-(?:success|warning|info)(?:-foreground)?(?![\w-])/.test(
    text
  )
}

function analyze(filePath, seen = new Set([filePath])) {
  const text = fs.readFileSync(filePath, "utf8")
  const deps = new Set()
  const registry = new Set()
  const helpers = new Set()
  const importRe = /from\s+["']([^"']+)["']/g
  let match = importRe.exec(text)

  if (usesTypeset(text)) {
    registry.add("typeset")
  }

  if (usesToneTokens(text)) {
    registry.add("standard-tokens")
  }

  while (match) {
    const spec = match[1]

    if (spec.startsWith("@/components/ui/") || spec.startsWith("@/hooks/")) {
      registry.add(path.basename(spec).replace(/\.(tsx|ts)$/, ""))
    } else if (spec.startsWith("@/components/standard/")) {
      const helper = standardHelperFor(spec)

      if (helper && !seen.has(helper)) {
        seen.add(helper)
        helpers.add(helper)
        // The helper's own imports belong to this item too.
        const nested = analyze(helper, seen)
        nested.dependencies.forEach((dep) => deps.add(dep))
        nested.registryNames.forEach((name) => registry.add(name))
        nested.helpers.forEach((file) => helpers.add(file))
      } else if (!helper) {
        registry.add(
          standardNameFor(path.basename(spec).replace(/\.(tsx|ts)$/, ""))
        )
      }
    } else if (
      !spec.startsWith(".") &&
      !spec.startsWith("@/") &&
      !spec.startsWith("node:")
    ) {
      const pkg = spec.startsWith("@")
        ? spec.split("/").slice(0, 2).join("/")
        : spec.split("/")[0]

      if (!skipPkgs.has(pkg)) {
        deps.add(pkg)
      }
    }

    match = importRe.exec(text)
  }

  return {
    dependencies: [...deps].sort(),
    registryNames: [...registry],
    // Bare names resolve against ui.shadcn.com, so point at this registry explicitly.
    registryDependencies: [...registry].sort().map((name) => `@jayrr/${name}`),
    helpers: [...helpers].sort(),
  }
}

function item(name, file, type, libraryName, title, options = {}) {
  const found = analyze(file)
  const displayTitle = title ?? titleFrom(name)
  const registryFile = { path: path.basename(file), type }

  // Standard installs beside its imports, so it never overwrites Classic in components/ui.
  if (options.target) {
    registryFile.target = options.target
  }

  // Dependencies are always derived from the imports, never carried over.
  const kept = { ...(options.existing?.get(name) ?? {}) }
  delete kept.dependencies
  delete kept.registryDependencies

  const entry = {
    name,
    type,
    title: displayTitle,
    description: `${displayTitle} from the ${libraryName} library.`,
    ...kept,
    files: [
      registryFile,
      ...found.helpers.map((helper) => ({
        path: path
          .relative(path.dirname(file), helper)
          .split(path.sep)
          .join("/"),
        type: helper.endsWith(".tsx") ? "registry:ui" : "registry:lib",
        target: helper.split(path.sep).join("/"),
      })),
    ],
  }

  if (found.dependencies.length > 0) {
    entry.dependencies = found.dependencies
  }

  if (found.registryDependencies.length > 0) {
    entry.registryDependencies = found.registryDependencies
  }

  return entry
}

function writeItems(file, items) {
  const names = new Set()

  for (const entry of items) {
    if (names.has(entry.name)) {
      throw new Error(`${file}: duplicate registry item "${entry.name}"`)
    }
    names.add(entry.name)
  }

  fs.writeFileSync(
    file,
    `${JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema/registry.json",
        items,
      },
      null,
      2
    )}\n`
  )
}

const uiEntries = readsEntries("components/ui/registry.json")

const uiItems = uiFiles.map((file) =>
  item(
    file.replace(/\.tsx$/, ""),
    path.join("components/ui", file),
    "registry:ui",
    "Classic",
    undefined,
    { existing: uiEntries }
  )
)

const standardFiles = fs
  .readdirSync("components/standard")
  .filter((file) => file.endsWith(".tsx") && file !== "index.tsx")
  .sort()

const standardEntries = readsEntries("components/standard/registry.json")

const standardItems = standardFiles.map((file) => {
  const base = file.replace(/\.tsx$/, "")

  return item(
    standardNameFor(base),
    path.join("components/standard", file),
    "registry:ui",
    "Standard",
    titleFrom(base),
    { existing: standardEntries, target: `components/standard/${file}` }
  )
})

// typeset.css ships as a file, not the `css` field, so the nested upstream
// stylesheet installs untouched and can be updated by copying it over.
const typesetItem = {
  name: "typeset",
  type: "registry:item",
  title: "Typeset",
  description:
    "Prose styles (shadcn/typeset plus article, compact, editor and chat presets) for the Standard library.",
  ...(standardEntries.get("typeset") ?? {}),
  files: [
    {
      path: "typeset.css",
      type: "registry:file",
      target: "components/standard/typeset.css",
    },
  ],
  docs: 'Add `@import "../components/standard/typeset.css";` to your global CSS, after `@import "tailwindcss";` (adjust the path to where the file landed).',
}

const standardTokensItem = {
  name: "standard-tokens",
  type: "registry:theme",
  title: "Standard Tokens",
  description:
    "Tone colors (success, warning, info, each with a -foreground) for the Standard library, used like shadcn's destructive.",
  ...(standardEntries.get("standard-tokens") ?? {}),
  cssVars: TONE_TOKENS,
}

writeItems("components/ui/registry.json", uiItems)
writeItems("components/standard/registry.json", [
  ...standardItems,
  typesetItem,
  standardTokensItem,
])
const hookEntries = readsEntries("hooks/registry.json")

const hookItems = fs
  .readdirSync("hooks")
  .filter((file) => file.endsWith(".ts"))
  .sort()
  .map((file) =>
    item(
      file.replace(/.ts$/, ""),
      path.join("hooks", file),
      "registry:hook",
      "Standard",
      undefined,
      { existing: hookEntries }
    )
  )

const allNames = [
  ...uiItems,
  ...standardItems,
  typesetItem,
  standardTokensItem,
  ...hookItems,
].map(
  (entry) => entry.name
)
const duplicates = allNames.filter(
  (name, index) => allNames.indexOf(name) !== index
)

if (duplicates.length > 0) {
  throw new Error(`duplicate registry items: ${duplicates.join(", ")}`)
}

writeItems("hooks/registry.json", hookItems)

// The Standard lint rules ship as a config module the installer spreads into
// their own eslint.config.mjs. It never targets that file, so it can't
// overwrite an existing config, and no component depends on it.
const libEntries = readsEntries("lib/registry.json")
const standardLintItem = {
  name: "standard-lint",
  type: "registry:file",
  title: "Standard Lint",
  description:
    "@shadcn/lint rules for the Standard library: theme colors only, sizes through props, containers take spacing.",
  ...(libEntries.get("standard-lint") ?? {}),
  files: [
    {
      path: "standard-lint.mjs",
      type: "registry:file",
      target: "lib/standard-lint.mjs",
    },
  ],
  devDependencies: ["@shadcn/lint"],
  docs: 'Add to eslint.config.mjs: `import { standardLint } from "./lib/standard-lint.mjs"`, then spread `...standardLint()` at the end of the exported array. Pass `standardLint({ ui: "@/your/components" })` if Standard lives somewhere other than @/components/standard. Run `npx eslint .`.',
}

writeItems("lib/registry.json", [standardLintItem])

fs.writeFileSync(
  "registry.json",
  `${JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "jayrr",
      homepage: "https://jayrr.dev",
      include: [
        "components/ui/registry.json",
        "components/standard/registry.json",
        "hooks/registry.json",
        "lib/registry.json",
      ],
    },
    null,
    2
  )}\n`
)

console.log(`ui items ${uiItems.length}`)
console.log(`standard items ${standardItems.length}`)
console.log(`hook items ${hookItems.length}`)
