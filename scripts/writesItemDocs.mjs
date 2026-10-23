import fs from "fs"
import path from "path"
import ts from "typescript"

// Runs after `shadcn build`. Writes public/r/docs/<item>.json for agents: the
// props of every component an item exports, read from its TypeScript types, and
// usage examples lifted from the gallery's demo cards. The MCP server returns
// these from registry_get_item.
const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, "public", "r", "docs")
const DEMO_DIRS = [
  "features/standard-library/components/demos",
  "features/ui-library/components/demos",
]
const DEMO_CARD = "RendersDemoCard"
const MAX_EXAMPLES = 4
const MAX_EXAMPLE_LINES = 80
const MAX_SETUP_LINES = 60
// Code plus setup, for the one example of a piece whose demos are all long.
const MAX_FALLBACK_LINES = 320
const MAX_TYPE_LENGTH = 240

// Inherited prop groups that say nothing an agent needs.
const NOISY_BASES = new Set([
  "AriaAttributes",
  "DOMAttributes",
  "Attributes",
  "RefAttributes",
  "ClassAttributes",
])

/**
 * Gallery pieces whose registry item has another name ("Input" ships as
 * text-field), read from the alias tables in resolvesInstallItems.ts so a
 * piece's demos count as that item's own.
 */
function readsPieceAliases() {
  const source = fs.readFileSync(
    path.join(
      ROOT,
      "features/ui-library/domain/catalog/resolvesInstallItems.ts"
    ),
    "utf8"
  )
  const aliases = new Map()

  for (const table of source.matchAll(
    /Aliases: Record<string, string> = \{([^}]*)\}/g
  )) {
    for (const [, piece, item] of table[1].matchAll(
      /"?([^"\n:]+?)"?:\s*"([^"]+)"/g
    )) {
      const slug = slugs(piece.trim())
      aliases.set(slug, new Set([...(aliases.get(slug) ?? []), item]))
    }
  }

  return aliases
}

const toPosix = (file) => file.split(path.sep).join("/")
const withoutExtension = (file) => file.replace(/\.(tsx?|jsx?)$/, "")
const isPascalCase = (name) => /^[A-Z][A-Za-z0-9]*$/.test(name)
/** "Date Picker", "DatePicker" and "date-picker" all become "date-picker". */
const slugs = (text) =>
  text
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
const isFromNodeModules = (node) =>
  node.getSourceFile().fileName.includes("/node_modules/")

function readsProgram() {
  const configPath = ts.findConfigFile(ROOT, ts.sys.fileExists, "tsconfig.json")
  const config = ts.getParsedCommandLineOfConfigFile(
    configPath,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(
          ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
        )
      },
    }
  )

  return ts.createProgram(config.fileNames, config.options)
}

/** Source file key ("components/ui/button") to the registry item names shipping it. */
function readsItemFiles() {
  const { items } = JSON.parse(
    fs.readFileSync(path.join(ROOT, "public", "r", "registry.json"), "utf8")
  )
  const itemsByFile = new Map()
  const filesByItem = new Map()

  for (const item of items) {
    const files = []

    for (const file of item.files ?? []) {
      const resolved = [
        file.path,
        path.join("components", "standard", file.path),
      ]
        .map((candidate) => toPosix(candidate))
        .find((candidate) => fs.existsSync(path.join(ROOT, candidate)))

      if (!resolved || !/\.(tsx?|jsx?)$/.test(resolved)) continue

      files.push(resolved)
      const key = withoutExtension(resolved)
      itemsByFile.set(key, [...(itemsByFile.get(key) ?? []), item.name])
    }

    filesByItem.set(item.name, files)
  }

  return { items, itemsByFile, filesByItem }
}

function dedents(code) {
  const lines = code.replace(/\r\n/g, "\n").split("\n")
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^ */)[0].length)
  const indent = Math.min(...indents)

  return lines
    .map((line) => line.slice(indent))
    .join("\n")
    .trim()
}

function truncates(text, length) {
  return text.length > length ? `${text.slice(0, length - 1)}…` : text
}

// ---------------------------------------------------------------------------
// Props

/** Destructuring defaults of a component's props parameter, by prop name. */
function readsDefaults(declaration) {
  const defaults = new Map()
  let fn = declaration

  if (ts.isVariableDeclaration(fn) && fn.initializer) {
    fn = fn.initializer
    // forwardRef(...), memo(...), React.forwardRef(...)
    while (ts.isCallExpression(fn) && fn.arguments.length) {
      fn = fn.arguments[0]
    }
  }

  if (!fn || !ts.isFunctionLike(fn)) return defaults

  const pattern = fn.parameters?.[0]?.name

  if (!pattern || !ts.isObjectBindingPattern(pattern)) return defaults

  for (const element of pattern.elements) {
    if (!element.initializer || element.dotDotDotToken) continue

    const name = (element.propertyName ?? element.name).getText()
    defaults.set(name, element.initializer.getText())
  }

  return defaults
}

/** JSDoc text with LF endings and soft-wrapped lines joined. */
function readsDocs(symbol, checker) {
  return ts
    .displayPartsToString(symbol.getDocumentationComment(checker))
    .replace(/\r\n/g, "\n")
    .replace(/([^\n])\n(?=[^\n\s-*])/g, "$1 ")
}

function readsInheritedBase(declaration) {
  let node = declaration.parent

  while (
    node &&
    !ts.isInterfaceDeclaration(node) &&
    !ts.isTypeAliasDeclaration(node)
  ) {
    node = node.parent
  }

  return node?.name?.text
}

function describesComponent(checker, symbol, sourceFile) {
  const type = checker.getTypeOfSymbolAtLocation(symbol, sourceFile)
  const signature = type.getCallSignatures()[0]

  if (!signature) return null

  const returns = checker.typeToString(signature.getReturnType())

  if (!/Element|ReactNode|ReactPortal|null/.test(returns)) return null

  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0]
  const defaults = declaration ? readsDefaults(declaration) : new Map()
  const parameter = signature.parameters[0]
  const props = []
  const inherits = new Set()

  if (parameter) {
    const propsType = checker.getTypeOfSymbolAtLocation(parameter, sourceFile)
    const members = propsType.isUnion()
      ? [
          ...new Map(
            propsType.types
              .flatMap((member) => checker.getPropertiesOfType(member))
              .map((prop) => [prop.name, prop])
          ).values(),
        ]
      : checker.getPropertiesOfType(propsType)

    for (const prop of members) {
      const declarations = prop.getDeclarations() ?? []

      if (declarations.length && declarations.every(isFromNodeModules)) {
        const base = readsInheritedBase(declarations[0])
        if (base && !NOISY_BASES.has(base)) inherits.add(base)
        continue
      }

      const propType = checker.getTypeOfSymbolAtLocation(prop, sourceFile)
      const description = readsDocs(prop, checker)
      const defaultTag = prop
        .getJsDocTags(checker)
        .find((tag) => tag.name === "default")
      const fallback =
        defaults.get(prop.name) ??
        (defaultTag?.text && ts.displayPartsToString(defaultTag.text))
      const optional = (prop.flags & ts.SymbolFlags.Optional) !== 0

      props.push({
        name: prop.name,
        // Optional already says "may be undefined", and cva adds `| null` to
        // every variant; both only cost tokens.
        type: truncates(
          checker
            .typeToString(propType, sourceFile, ts.TypeFormatFlags.NoTruncation)
            .replace(/ \| null(?= |$)/g, "")
            .replace(/ \| undefined$/, ""),
          MAX_TYPE_LENGTH
        ),
        ...(!optional && { required: true }),
        ...(fallback && { default: fallback }),
        ...(description && { description }),
      })
    }
  }

  const description = readsDocs(symbol, checker)

  return {
    name: symbol.name,
    ...(description && { description }),
    props,
    ...(inherits.size && { inherits: [...inherits].sort() }),
  }
}

function describesFile(program, checker, file) {
  const sourceFile = program.getSourceFile(toPosix(path.join(ROOT, file)))

  if (!sourceFile) return []

  const moduleSymbol = checker.getSymbolAtLocation(sourceFile)

  if (!moduleSymbol) return []

  return checker
    .getExportsOfModule(moduleSymbol)
    .filter((symbol) => isPascalCase(symbol.name))
    .map((symbol) =>
      symbol.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(symbol)
        : symbol
    )
    .filter((symbol) => symbol.flags & ts.SymbolFlags.Value)
    .map((symbol) => describesComponent(checker, symbol, sourceFile))
    .filter(Boolean)
}

// ---------------------------------------------------------------------------
// Examples

function listsDemoFiles() {
  const files = []
  const walks = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walks(full)
      else if (entry.name.endsWith(".tsx")) files.push(full)
    }
  }

  for (const dir of DEMO_DIRS) walks(path.join(ROOT, dir))

  return files
}

/** Local name to { name, specifier, isDefault } for every import in a file. */
function readsImports(sourceFile) {
  const imports = new Map()

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      statement.importClause?.isTypeOnly
    )
      continue

    const specifier = statement.moduleSpecifier.text
    const clause = statement.importClause

    if (!clause) continue
    if (clause.name) {
      imports.set(clause.name.text, {
        name: clause.name.text,
        specifier,
        isDefault: true,
      })
    }

    const bindings = clause.namedBindings

    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        if (element.isTypeOnly) continue
        imports.set(element.name.text, {
          name: (element.propertyName ?? element.name).text,
          local: element.name.text,
          specifier,
        })
      }
    } else if (bindings && ts.isNamespaceImport(bindings)) {
      imports.set(bindings.name.text, {
        namespace: bindings.name.text,
        specifier,
      })
    }
  }

  return imports
}

/** Top-level declarations other than the demo components themselves, by name. */
function readsLocals(sourceFile) {
  const locals = new Map()

  for (const statement of sourceFile.statements) {
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          locals.set(declaration.name.text, statement)
        }
      }
    } else if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement)) &&
      statement.name &&
      !statement.name.text.startsWith("Renders")
    ) {
      locals.set(statement.name.text, statement)
    }
  }

  return locals
}

function collectsIdentifiers(node, found = new Set()) {
  if (ts.isIdentifier(node)) found.add(node.text)
  ts.forEachChild(node, (child) => void collectsIdentifiers(child, found))
  return found
}

/**
 * JSX tags in a subtree, by their imported root name, with the props set on
 * them. The tag's own name counts too, so sub-components (CardHeader) score
 * as coverage when they take no props.
 */
function collectsTagUses(node, found = new Map()) {
  if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
    const tag = node.tagName.getText()
    const root = tag.split(".")[0]
    const props = found.get(root) ?? new Set()

    props.add(`<${tag}>`)
    for (const attribute of node.attributes.properties) {
      if (ts.isJsxAttribute(attribute))
        props.add(`${tag}.${attribute.name.getText()}`)
    }
    found.set(root, props)
  }
  ts.forEachChild(node, (child) => void collectsTagUses(child, found))
  return found
}

function readsLabel(element) {
  const attribute = element.openingElement.attributes.properties.find(
    (property) =>
      ts.isJsxAttribute(property) && property.name.getText() === "label"
  )
  const value = attribute?.initializer

  if (!value) return undefined
  if (ts.isStringLiteral(value)) return value.text
  // Computed labels (PANEL_LABELS[panel]) mean nothing outside the demo.
  if (
    ts.isJsxExpression(value) &&
    value.expression &&
    ts.isStringLiteralLike(value.expression)
  ) {
    return value.expression.text
  }
  return undefined
}

function formatsImports(identifiers, imports) {
  const byModule = new Map()

  for (const identifier of identifiers) {
    const entry = imports.get(identifier)

    if (!entry || entry.specifier.startsWith("@/features/")) continue

    const list = byModule.get(entry.specifier) ?? []
    byModule.set(entry.specifier, list)

    if (entry.namespace) list.push(`* as ${entry.namespace}`)
    else if (entry.isDefault) list.unshift(`default:${entry.name}`)
    else
      list.push(
        entry.local === entry.name
          ? entry.name
          : `${entry.name} as ${entry.local}`
      )
  }

  return [...byModule]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([specifier, names]) => {
      const namespace = names.find((name) => name.startsWith("* as "))
      if (namespace) return `import ${namespace} from "${specifier}"`

      const fallback = names.find((name) => name.startsWith("default:"))
      const named = names.filter((name) => !name.startsWith("default:")).sort()
      const parts = [
        fallback?.slice("default:".length),
        named.length ? `{ ${named.join(", ")} }` : undefined,
      ].filter(Boolean)

      return `import ${parts.join(", ")} from "${specifier}"`
    })
}

/** Local declarations a card uses, followed one level deep, in file order. */
function readsSetup(identifiers, locals, sourceFile) {
  const statements = new Set()
  const pending = [...identifiers]
  const seen = new Set()

  while (pending.length) {
    const name = pending.pop()
    if (seen.has(name)) continue
    seen.add(name)

    const statement = locals.get(name)
    if (!statement || statements.has(statement)) continue

    statements.add(statement)
    pending.push(...collectsIdentifiers(statement))
  }

  const ordered = [...statements].sort((a, b) => a.pos - b.pos)
  const code = ordered
    .map((statement) => dedents(statement.getText(sourceFile)))
    .join("\n\n")

  return { code, statements: ordered }
}

/** Tag of the outermost element, looking through fragments and plain DOM wrappers. */
function readsRootTag(nodes) {
  for (const node of nodes) {
    if (ts.isJsxFragment(node)) {
      const tag = readsRootTag(node.children)
      if (tag) return tag
      continue
    }
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = (
        ts.isJsxElement(node) ? node.openingElement : node
      ).tagName.getText()
      if (/^[A-Z]/.test(tag)) return tag.split(".")[0]
      if (ts.isJsxElement(node)) {
        const inner = readsRootTag(node.children)
        if (inner) return inner
      }
    }
  }
  return null
}

/** The JSX a `if (pieceName === "X") { return ... }` branch renders, with X. */
function readsPieceBranch(node) {
  if (!ts.isIfStatement(node)) return null

  const match = /pieceName\s*===\s*"([^"]+)"/.exec(node.expression.getText())
  const block = node.thenStatement

  if (!match || !ts.isBlock(block)) return null

  const returned = block.statements.find(ts.isReturnStatement)?.expression
  let jsx = returned

  while (jsx && ts.isParenthesizedExpression(jsx)) jsx = jsx.expression

  return jsx &&
    (ts.isJsxElement(jsx) ||
      ts.isJsxSelfClosingElement(jsx) ||
      ts.isJsxFragment(jsx))
    ? { title: match[1], nodes: [jsx] }
    : null
}

function collectsExamples(program, itemsByFile) {
  const examplesByItem = new Map()

  for (const file of listsDemoFiles()) {
    const sourceFile = program.getSourceFile(toPosix(file))
    if (!sourceFile) continue

    const imports = readsImports(sourceFile)
    const locals = readsLocals(sourceFile)
    // pieces/date-picker.tsx and rendersStandardDatePickerDemo.tsx both demo "date-picker".
    const filePiece = slugs(
      path.basename(file, ".tsx").replace(/^renders(Standard)?(.*?)Demo$/, "$2")
    )
    const keyOf = (tag) => {
      const specifier = imports.get(tag)?.specifier
      const key = specifier?.startsWith("@/") && specifier.slice(2)

      return key && itemsByFile.has(key) ? key : null
    }

    const visits = (node) => {
      if (
        ts.isJsxElement(node) &&
        node.openingElement.tagName.getText() === DEMO_CARD
      ) {
        addsExample(
          node.children.filter(
            (child) => !(ts.isJsxText(child) && !child.text.trim())
          ),
          readsLabel(node)
        )
        return
      }

      // Classic demos: one shared card around a per-piece branch.
      const branch = readsPieceBranch(node)

      if (branch) {
        addsExample(branch.nodes, branch.title)
        return
      }

      ts.forEachChild(node, visits)
    }

    const addsExample = (nodes, title) => {
      if (!nodes.length) return

      // Start at the first line's indentation so dedents sees every line's.
      const start = nodes[0].getStart(sourceFile)
      const lineStart = sourceFile.text.lastIndexOf("\n", start - 1) + 1
      const code = dedents(
        sourceFile.text.slice(
          /^\s*$/.test(sourceFile.text.slice(lineStart, start))
            ? lineStart
            : start,
          nodes.at(-1).end
        )
      )
      const tags = new Map()

      for (const node of nodes) collectsTagUses(node, tags)

      const identifiers = new Set(
        nodes.flatMap((node) => [...collectsIdentifiers(node)])
      )
      const setup = readsSetup(
        [...identifiers].filter((name) => locals.has(name)),
        locals,
        sourceFile
      )
      const setupIdentifiers = setup.statements.flatMap((statement) => [
        ...collectsIdentifiers(statement),
      ])
      const propsByKey = new Map()

      for (const [tag, props] of tags) {
        const key = keyOf(tag)
        if (!key) continue

        const merged = propsByKey.get(key) ?? new Set()
        for (const prop of props) merged.add(prop)
        propsByKey.set(key, merged)
      }

      if (!propsByKey.size) return

      const codeLines = code.split("\n").length
      const setupLines = setup.code ? setup.code.split("\n").length : 0
      const rootKey = keyOf(readsRootTag(nodes) ?? "")
      const titleSlug = slugs(title ?? "")
      const example = {
        ...(title && { title }),
        imports: formatsImports(
          new Set([...identifiers, ...setupIdentifiers]),
          imports
        ),
        ...(setup.code && { setup: setup.code }),
        code,
      }

      for (const [key, props] of propsByKey) {
        for (const item of itemsByFile.get(key)) {
          const list = examplesByItem.get(item) ?? []
          list.push({
            example,
            props,
            // The example is about this item, not one that merely contains it.
            subject: [filePiece, titleSlug].some(
              (piece) =>
                piece === item.replace(/^standard-/, "") ||
                PIECE_ALIASES.get(piece)?.has(item)
            ),
            leads: rootKey === key,
            others: propsByKey.size - 1,
            lines: codeLines + setupLines,
            fits:
              codeLines <= MAX_EXAMPLE_LINES && setupLines <= MAX_SETUP_LINES,
          })
          examplesByItem.set(item, list)
        }
      }
    }

    visits(sourceFile)
  }

  return examplesByItem
}

/**
 * Greedy: each pick shows the most props not seen in earlier picks, with
 * focused (few other pieces), short, self-contained examples breaking ties.
 * The item's own demos come first; demos of other pieces that happen to use
 * it only fill in when it has fewer than two of its own.
 */
function picksExamples(candidates = []) {
  const seenCode = new Set()
  const unique = candidates.filter(({ example }) => {
    if (seenCode.has(example.code)) return false
    seenCode.add(example.code)
    return true
  })
  const own = unique.filter((candidate) => candidate.subject && candidate.fits)
  const borrowed = unique.filter(
    (candidate) => !candidate.subject && candidate.fits
  )
  // Complex pieces often have only long demos; one beats none.
  const longOwn = unique
    .filter((candidate) => candidate.subject && !candidate.fits)
    .filter((candidate) => candidate.lines <= MAX_FALLBACK_LINES)
  const covered = new Set()
  const picked = []

  const scores = ({ props, leads, others, lines, example }) => {
    const fresh = [...props].filter((prop) => !covered.has(prop)).length

    return (
      fresh * 3 +
      (leads ? 3 : 0) -
      others * 4 -
      (example.setup ? 2 : 0) -
      lines / 8
    )
  }

  const takes = (pool, limit) => {
    while (picked.length < limit && pool.length) {
      pool.sort((a, b) => scores(b) - scores(a))
      const best = pool.shift()

      for (const prop of best.props) covered.add(prop)
      picked.push(best.example)
    }
  }

  takes(own, MAX_EXAMPLES)
  takes(
    borrowed.filter((candidate) => candidate.leads),
    2
  )

  if (!picked.length) {
    takes(longOwn.sort((a, b) => a.lines - b.lines).slice(0, 1), 1)
  }

  return picked
}

// ---------------------------------------------------------------------------

const PIECE_ALIASES = readsPieceAliases()
const program = readsProgram()
const checker = program.getTypeChecker()
const { items, itemsByFile, filesByItem } = readsItemFiles()
const examplesByItem = collectsExamples(program, itemsByFile)

fs.mkdirSync(OUT_DIR, { recursive: true })

const written = new Set()
let withProps = 0
let withExamples = 0

for (const item of items) {
  const components = (filesByItem.get(item.name) ?? []).flatMap((file) =>
    describesFile(program, checker, file)
  )
  const examples = picksExamples(examplesByItem.get(item.name))

  if (!components.length && !examples.length) continue

  if (components.length) withProps++
  if (examples.length) withExamples++

  const file = `${item.name}.json`
  fs.writeFileSync(
    path.join(OUT_DIR, file),
    `${JSON.stringify({ name: item.name, components, examples }, null, 2)}\n`
  )
  written.add(file)
}

for (const file of fs.readdirSync(OUT_DIR)) {
  if (!written.has(file)) fs.rmSync(path.join(OUT_DIR, file))
}

console.log(
  `wrote docs for ${written.size} of ${items.length} items (${withProps} with props, ${withExamples} with examples)`
)
