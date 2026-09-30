import fs from "fs"
import path from "path"

const skipPkgs = new Set(["react", "react-dom"])

const uiFiles = fs
  .readdirSync("components/ui")
  .filter((file) => file.endsWith(".tsx"))
  .sort()

const uiNames = new Set(uiFiles.map((file) => file.replace(/\.tsx$/, "")))

// Standard files that share a name with a Classic file publish as standard-<name>.
function standardNameFor(base) {
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

function analyze(filePath) {
  const text = fs.readFileSync(filePath, "utf8")
  const deps = new Set()
  const registry = new Set()
  const importRe = /from\s+["']([^"']+)["']/g
  let match = importRe.exec(text)

  while (match) {
    const spec = match[1]

    if (spec.startsWith("@/components/ui/") || spec.startsWith("@/hooks/")) {
      registry.add(path.basename(spec).replace(/\.(tsx|ts)$/, ""))
    } else if (spec.startsWith("@/components/standard/")) {
      registry.add(standardNameFor(path.basename(spec).replace(/\.(tsx|ts)$/, "")))
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
    // Bare names resolve against ui.shadcn.com, so point at this registry explicitly.
    registryDependencies: [...registry].sort().map((name) => `@jayrr/${name}`),
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

  const {
    dependencies: _dependencies,
    registryDependencies: _registryDependencies,
    ...kept
  } = options.existing?.get(name) ?? {}

  const entry = {
    name,
    type,
    title: displayTitle,
    description: `${displayTitle} from the ${libraryName} library.`,
    ...kept,
    files: [registryFile],
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

writeItems("components/ui/registry.json", uiItems)
writeItems("components/standard/registry.json", standardItems)
writeItems("hooks/registry.json", [
  item("use-mobile", "hooks/use-mobile.ts", "registry:hook", "Classic", undefined, {
    existing: readsEntries("hooks/registry.json"),
  }),
])

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
      ],
    },
    null,
    2
  )}\n`
)

console.log(`ui items ${uiItems.length}`)
console.log(`standard items ${standardItems.length}`)
