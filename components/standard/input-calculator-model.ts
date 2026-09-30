/**
 * Headless engine for the Input Calculator: it reads a spreadsheet-style
 * formula such as `=ROUND(price * qty * (1 + tax), 2)` and returns its value.
 * Nothing here touches React, so the same functions work in a server action,
 * a test, or a worker.
 *
 * - Operators: + - * / ^ & (join text), = <> < > <= >= and postfix %.
 *   Precedence follows maths, not Excel: -2^2 is -4 and 2^3^2 is 512.
 * - Values: numbers (1.5, .5, 2e3), "text" ("" escapes a quote), TRUE, FALSE.
 * - Names resolve against `variables`, ignoring case. A variable whose value
 *   is a string starting with "=" is itself a formula and may use other
 *   variables; loops come back as #CIRC!.
 * - With `references`, A1-style names are spreadsheet cells: a missing one
 *   is empty, `$` pins a row or column, and `B2:C9` is a range for SUM() etc.
 *   `evaluatesVariables` works out a whole sheet of them with one cache.
 * - Functions ignore case too. See CALC_FUNCTION_NAMES for the built-ins;
 *   `functions` adds your own or replaces one.
 * - Errors come back as Excel-style codes (#DIV/0!, #NAME?, #VALUE!, #NUM!)
 *   with a message and, when it points at the text, a start/end range.
 */

export type CalcValue = number | string | boolean

/** What a function argument can be: one value, or a list from a variable. */
export type CalcArg = CalcValue | CalcValue[]

/** A value, a list (for SUM, AVERAGE…), or a formula string starting with "=". */
export type CalcVariable = CalcValue | CalcValue[]

export type CalcVariables = Record<string, CalcVariable>

export type CalcFunction = (...args: CalcArg[]) => CalcValue

export type CalcFunctions = Record<string, CalcFunction>

export type CalcErrorCode =
  | "#ERROR!"
  | "#NAME?"
  | "#VALUE!"
  | "#DIV/0!"
  | "#NUM!"
  | "#N/A"
  | "#CIRC!"

export type CalcErrorInfo = {
  code: CalcErrorCode
  message: string
  /** Character range in the formula the error points at, when it has one. */
  start?: number
  end?: number
  /** True when the formula just isn't finished yet, e.g. `1 +` or `SUM(1`. */
  incomplete?: boolean
}

export type CalcResult =
  | { status: "empty"; formula: string; dependencies: string[] }
  | {
      status: "ok"
      formula: string
      value: CalcValue
      /** Variables the formula reads, spelled as they are declared. */
      dependencies: string[]
    }
  | {
      status: "error"
      formula: string
      error: CalcErrorInfo
      dependencies: string[]
    }

export type CalcOptions = {
  variables?: CalcVariables
  functions?: CalcFunctions
  /**
   * Evaluate only text that starts with "=", like a spreadsheet cell. Anything
   * else is a literal: "42" is 42, "15%" is 0.15, "TRUE" is true, the rest is text.
   */
  requireEquals?: boolean
  /**
   * Treat A1-style names (B2, $C$9) as spreadsheet cells: a missing one is
   * empty ("" as text, 0 as a number) instead of #NAME?.
   */
  references?: boolean
}

/** Throw this from a custom function to return a specific error code. */
export class CalcError extends Error {
  code: CalcErrorCode
  start?: number
  end?: number
  incomplete?: boolean

  constructor(
    code: CalcErrorCode,
    message: string,
    range?: { start: number; end: number; incomplete?: boolean }
  ) {
    super(message)
    this.name = "CalcError"
    this.code = code
    this.start = range?.start
    this.end = range?.end
    this.incomplete = range?.incomplete
  }
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

export type CalcTokenType =
  | "equals"
  | "number"
  | "string"
  | "boolean"
  | "name"
  | "reference"
  | "colon"
  | "function"
  | "operator"
  | "percent"
  | "paren"
  | "separator"
  | "space"
  | "unknown"

export type CalcToken = {
  type: CalcTokenType
  text: string
  start: number
  end: number
}

const NUMBER = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/
const NAME = /^[\p{L}_][\p{L}\p{N}_.]*/u
/** A1-style cell: up to three letters then digits, either side pinned with $. */
const REFERENCE = /^\$?[A-Za-z]{1,3}\$?\d+(?![\p{L}\p{N}_.(])/u
const REFERENCE_PARTS = /^\$?([A-Za-z]{1,3})\$?(\d+)$/
const SPACE = /^\s+/
const OPERATORS = ["<=", ">=", "<>", "+", "-", "*", "/", "^", "&", "=", "<", ">", "×", "÷"]
const OPERATOR_ALIASES: Record<string, string> = { "×": "*", "÷": "/" }

/**
 * Splits a formula into tokens. Joining every token's text gives the input
 * back, spaces included, so the list can drive syntax highlighting.
 */
export function tokenizesFormula(formula: string): CalcToken[] {
  const tokens: CalcToken[] = []
  let index = 0

  const pushes = (type: CalcTokenType, text: string) => {
    tokens.push({ type, text, start: index, end: index + text.length })
    index += text.length
  }

  while (index < formula.length) {
    const rest = formula.slice(index)
    const char = rest[0]

    const space = SPACE.exec(rest)
    if (space) {
      pushes("space", space[0])
      continue
    }

    // A leading "=" marks a formula; it is not the equality operator.
    if (char === "=" && tokens.every((token) => token.type === "space")) {
      pushes("equals", "=")
      continue
    }

    const number = NUMBER.exec(rest)
    if (number) {
      pushes("number", number[0])
      continue
    }

    if (char === '"') {
      let end = 1
      while (end < rest.length) {
        if (rest[end] === '"') {
          if (rest[end + 1] === '"') end += 2
          else {
            end += 1
            break
          }
        } else end += 1
      }
      pushes("string", rest.slice(0, end))
      continue
    }

    const reference = REFERENCE.exec(rest)
    if (reference) {
      pushes("reference", reference[0])
      continue
    }

    const name = NAME.exec(rest)
    if (name) {
      const after = rest.slice(name[0].length).trimStart()
      const upper = name[0].toUpperCase()
      if (after.startsWith("(")) pushes("function", name[0])
      else if (upper === "TRUE" || upper === "FALSE") pushes("boolean", name[0])
      else pushes("name", name[0])
      continue
    }

    const operator = OPERATORS.find((candidate) => rest.startsWith(candidate))
    if (operator) {
      pushes("operator", operator)
      continue
    }

    if (char === "%") pushes("percent", char)
    else if (char === "(" || char === ")") pushes("paren", char)
    else if (char === "," || char === ";") pushes("separator", char)
    else if (char === ":") pushes("colon", char)
    else pushes("unknown", char)
  }

  return tokens
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

type Node = { start: number; end: number } & (
  | { kind: "number"; value: number }
  | { kind: "string"; value: string }
  | { kind: "boolean"; value: boolean }
  | { kind: "name"; name: string; reference?: boolean }
  | { kind: "range"; from: string; to: string }
  | { kind: "call"; name: string; args: Node[] }
  | { kind: "unary"; operator: string; operand: Node }
  | { kind: "percent"; operand: Node }
  | { kind: "binary"; operator: string; left: Node; right: Node }
)

/** [left, right] binding power. Right-associative when right < left. */
const BINARY: Record<string, [number, number]> = {
  "=": [1, 2],
  "<>": [1, 2],
  "<": [1, 2],
  ">": [1, 2],
  "<=": [1, 2],
  ">=": [1, 2],
  "&": [3, 4],
  "+": [5, 6],
  "-": [5, 6],
  "*": [7, 8],
  "/": [7, 8],
  "^": [10, 9],
}
const UNARY_POWER = 9
const PERCENT_POWER = 11

function parsesFormula(formula: string): Node {
  const tokens = tokenizesFormula(formula).filter(
    (token) => token.type !== "space" && token.type !== "equals"
  )
  let position = 0

  const peek = () => tokens[position]
  const ends = () =>
    new CalcError("#ERROR!", "The formula ends too early.", {
      start: formula.length,
      end: formula.length,
      incomplete: true,
    })
  const unexpected = (token: CalcToken) =>
    new CalcError("#ERROR!", `Unexpected "${token.text}".`, token)

  function parsesPrefix(): Node {
    const token = tokens[position++]
    if (!token) throw ends()

    switch (token.type) {
      case "number":
        return { kind: "number", value: Number(token.text), ...span(token) }
      case "string": {
        if (token.text.length < 2 || !token.text.endsWith('"')) {
          throw new CalcError("#ERROR!", "Text is missing its closing quote.", {
            ...span(token),
            incomplete: true,
          })
        }
        const value = token.text.slice(1, -1).replace(/""/g, '"')
        return { kind: "string", value, ...span(token) }
      }
      case "boolean":
        return {
          kind: "boolean",
          value: token.text.toUpperCase() === "TRUE",
          ...span(token),
        }
      case "name":
        return { kind: "name", name: token.text, ...span(token) }
      case "reference": {
        if (peek()?.type !== "colon") {
          return { kind: "name", name: token.text, reference: true, ...span(token) }
        }
        position += 1 // ":"
        const to = tokens[position++]
        if (!to) throw ends()
        if (to.type !== "reference") throw unexpected(to)
        return { kind: "range", from: token.text, to: to.text, start: token.start, end: to.end }
      }
      case "function": {
        position += 1 // "("
        const args: Node[] = []
        if (peek()?.text === ")") {
          const close = tokens[position++]
          return { kind: "call", name: token.text, args, start: token.start, end: close.end }
        }
        while (true) {
          args.push(parsesExpression(0))
          const next = tokens[position++]
          if (!next) {
            throw new CalcError("#ERROR!", `${token.text.toUpperCase()}( is missing its ")".`, {
              start: token.start,
              end: formula.length,
              incomplete: true,
            })
          }
          if (next.text === ")") {
            return { kind: "call", name: token.text, args, start: token.start, end: next.end }
          }
          if (next.type !== "separator") throw unexpected(next)
        }
      }
      case "paren": {
        if (token.text !== "(") throw unexpected(token)
        const inner = parsesExpression(0)
        const close = tokens[position++]
        if (!close) {
          throw new CalcError("#ERROR!", 'A "(" is missing its ")".', {
            start: token.start,
            end: formula.length,
            incomplete: true,
          })
        }
        if (close.text !== ")") throw unexpected(close)
        return { ...inner, start: token.start, end: close.end }
      }
      case "operator": {
        if (token.text !== "+" && token.text !== "-") throw unexpected(token)
        const operand = parsesExpression(UNARY_POWER)
        return { kind: "unary", operator: token.text, operand, start: token.start, end: operand.end }
      }
      case "unknown":
        throw new CalcError("#ERROR!", `"${token.text}" isn't allowed in a formula.`, token)
      default:
        throw unexpected(token)
    }
  }

  function parsesExpression(minPower: number): Node {
    let left = parsesPrefix()

    while (true) {
      const token = peek()
      if (!token) break

      if (token.type === "percent") {
        if (PERCENT_POWER < minPower) break
        position += 1
        left = { kind: "percent", operand: left, start: left.start, end: token.end }
        continue
      }

      if (token.type !== "operator") break
      const operator = OPERATOR_ALIASES[token.text] ?? token.text
      const [leftPower, rightPower] = BINARY[operator]
      if (leftPower < minPower) break
      position += 1
      const right = parsesExpression(rightPower)
      left = { kind: "binary", operator, left, right, start: left.start, end: right.end }
    }

    return left
  }

  if (tokens.length === 0) throw ends()
  const tree = parsesExpression(0)
  const extra = peek()
  if (extra) throw unexpected(extra)
  return tree
}

function span(token: CalcToken) {
  return { start: token.start, end: token.end }
}

// ---------------------------------------------------------------------------
// Coercion
// ---------------------------------------------------------------------------

/** Drops float noise the way a spreadsheet does: 0.1 + 0.2 is 0.3. */
function normalizes(value: number) {
  if (!Number.isFinite(value)) {
    throw new CalcError("#NUM!", "The result is too large to show.")
  }
  return Number(value.toPrecision(15)) || 0
}

function scalarOf(value: CalcArg, what = "a single value"): CalcValue {
  if (Array.isArray(value)) {
    throw new CalcError("#VALUE!", `A list can't be used as ${what}. Wrap it in SUM() or similar.`)
  }
  return value
}

/** TRUE is 1, FALSE is 0, "12" is 12, "" is 0. Other text is #VALUE!. */
export function toCalcNumber(value: CalcArg): number {
  const scalar = scalarOf(value, "a number")
  if (typeof scalar === "number") return scalar
  if (typeof scalar === "boolean") return scalar ? 1 : 0
  const trimmed = scalar.trim()
  if (trimmed === "") return 0
  const literal = readsLiteral(trimmed)
  if (typeof literal === "number") return literal
  throw new CalcError("#VALUE!", `"${scalar}" isn't a number.`)
}

export function toCalcText(value: CalcArg): string {
  const scalar = scalarOf(value, "text")
  if (typeof scalar === "string") return scalar
  return formatsCalcValue(scalar)
}

export function toCalcBoolean(value: CalcArg): boolean {
  const scalar = scalarOf(value, "TRUE or FALSE")
  if (typeof scalar === "boolean") return scalar
  if (typeof scalar === "number") return scalar !== 0
  const upper = scalar.trim().toUpperCase()
  if (upper === "TRUE") return true
  if (upper === "FALSE") return false
  throw new CalcError("#VALUE!", `"${scalar}" isn't TRUE or FALSE.`)
}

/** Default display: 15 significant digits, TRUE/FALSE in capitals. */
export function formatsCalcValue(value: CalcValue): string {
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE"
  if (typeof value === "number") return String(Number(value.toPrecision(15)) || 0)
  return value
}

const LITERAL_NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?%?$/

/** What a spreadsheet makes of typed text that isn't a formula. */
function readsLiteral(text: string): CalcValue {
  const trimmed = text.trim()
  if (LITERAL_NUMBER.test(trimmed)) {
    return trimmed.endsWith("%")
      ? normalizes(Number(trimmed.slice(0, -1)) / 100)
      : Number(trimmed)
  }
  const upper = trimmed.toUpperCase()
  if (upper === "TRUE") return true
  if (upper === "FALSE") return false
  return text
}

/** Numbers in the arguments: lists keep only their numbers, single values are coerced. */
function numbersIn(args: CalcArg[]) {
  const numbers: number[] = []
  for (const arg of args) {
    if (Array.isArray(arg)) {
      for (const item of arg) if (typeof item === "number") numbers.push(item)
    } else numbers.push(toCalcNumber(arg))
  }
  return numbers
}

function booleansIn(args: CalcArg[]) {
  const booleans: boolean[] = []
  for (const arg of args) {
    if (Array.isArray(arg)) {
      for (const item of arg) {
        if (typeof item === "boolean") booleans.push(item)
        else if (typeof item === "number") booleans.push(item !== 0)
      }
    } else booleans.push(toCalcBoolean(arg))
  }
  return booleans
}

function compares(left: CalcValue, right: CalcValue) {
  // Spreadsheet order across types: numbers < text < booleans.
  const rank = (value: CalcValue) =>
    typeof value === "number" ? 0 : typeof value === "string" ? 1 : 2
  if (rank(left) !== rank(right)) return rank(left) - rank(right)
  if (typeof left === "string") {
    return left.localeCompare(right as string, undefined, { sensitivity: "accent" })
  }
  return Number(left) - Number(right)
}

// ---------------------------------------------------------------------------
// Built-in functions
// ---------------------------------------------------------------------------

type BuiltIn = { min: number; max: number; run: (args: CalcArg[]) => CalcValue }

function rounds(value: number, digits: number, mode: "nearest" | "up" | "down") {
  const factor = 10 ** Math.trunc(digits)
  const scaled = Number((Math.abs(value) * factor).toPrecision(15))
  const whole =
    mode === "nearest" ? Math.round(scaled) : mode === "up" ? Math.ceil(scaled) : Math.floor(scaled)
  return normalizes((Math.sign(value) * whole) / factor)
}

function positive(value: number, name: string) {
  if (value <= 0) throw new CalcError("#NUM!", `${name} needs a number above 0.`)
  return value
}

const n = toCalcNumber

const BUILT_INS: Record<string, BuiltIn> = {
  // Aggregates
  SUM: { min: 1, max: Infinity, run: (args) => numbersIn(args).reduce((a, b) => a + b, 0) },
  PRODUCT: { min: 1, max: Infinity, run: (args) => numbersIn(args).reduce((a, b) => a * b, 1) },
  AVERAGE: {
    min: 1,
    max: Infinity,
    run: (args) => {
      const numbers = numbersIn(args)
      if (numbers.length === 0) throw new CalcError("#DIV/0!", "AVERAGE has no numbers to average.")
      return numbers.reduce((a, b) => a + b, 0) / numbers.length
    },
  },
  MEDIAN: {
    min: 1,
    max: Infinity,
    run: (args) => {
      const numbers = numbersIn(args).sort((a, b) => a - b)
      if (numbers.length === 0) throw new CalcError("#NUM!", "MEDIAN has no numbers.")
      const middle = Math.floor(numbers.length / 2)
      return numbers.length % 2 ? numbers[middle] : (numbers[middle - 1] + numbers[middle]) / 2
    },
  },
  MIN: { min: 1, max: Infinity, run: (args) => { const v = numbersIn(args); return v.length ? Math.min(...v) : 0 } },
  MAX: { min: 1, max: Infinity, run: (args) => { const v = numbersIn(args); return v.length ? Math.max(...v) : 0 } },
  COUNT: {
    min: 1,
    max: Infinity,
    run: (args) =>
      args.flat().filter((value) => typeof value === "number").length,
  },

  // Maths
  ABS: { min: 1, max: 1, run: ([x]) => Math.abs(n(x)) },
  SIGN: { min: 1, max: 1, run: ([x]) => Math.sign(n(x)) },
  SQRT: {
    min: 1,
    max: 1,
    run: ([x]) => {
      const value = n(x)
      if (value < 0) throw new CalcError("#NUM!", "SQRT can't take a negative number.")
      return Math.sqrt(value)
    },
  },
  POWER: { min: 2, max: 2, run: ([x, y]) => n(x) ** n(y) },
  EXP: { min: 1, max: 1, run: ([x]) => Math.exp(n(x)) },
  LN: { min: 1, max: 1, run: ([x]) => Math.log(positive(n(x), "LN")) },
  LOG10: { min: 1, max: 1, run: ([x]) => Math.log10(positive(n(x), "LOG10")) },
  LOG: {
    min: 1,
    max: 2,
    run: ([x, base = 10]) => Math.log(positive(n(x), "LOG")) / Math.log(positive(n(base), "LOG")),
  },
  MOD: {
    min: 2,
    max: 2,
    run: ([x, y]) => {
      const divisor = n(y)
      if (divisor === 0) throw new CalcError("#DIV/0!", "MOD can't divide by zero.")
      // The sign follows the divisor, as in a spreadsheet.
      return n(x) - divisor * Math.floor(n(x) / divisor)
    },
  },
  ROUND: { min: 1, max: 2, run: ([x, d = 0]) => rounds(n(x), n(d), "nearest") },
  ROUNDUP: { min: 1, max: 2, run: ([x, d = 0]) => rounds(n(x), n(d), "up") },
  ROUNDDOWN: { min: 1, max: 2, run: ([x, d = 0]) => rounds(n(x), n(d), "down") },
  TRUNC: { min: 1, max: 2, run: ([x, d = 0]) => rounds(n(x), n(d), "down") },
  INT: { min: 1, max: 1, run: ([x]) => Math.floor(n(x)) },
  CEILING: {
    min: 1,
    max: 2,
    run: ([x, step = 1]) => (n(step) === 0 ? 0 : Math.ceil(n(x) / n(step)) * n(step)),
  },
  FLOOR: {
    min: 1,
    max: 2,
    run: ([x, step = 1]) => (n(step) === 0 ? 0 : Math.floor(n(x) / n(step)) * n(step)),
  },
  PI: { min: 0, max: 0, run: () => Math.PI },
  SIN: { min: 1, max: 1, run: ([x]) => Math.sin(n(x)) },
  COS: { min: 1, max: 1, run: ([x]) => Math.cos(n(x)) },
  TAN: { min: 1, max: 1, run: ([x]) => Math.tan(n(x)) },
  ASIN: { min: 1, max: 1, run: ([x]) => Math.asin(n(x)) },
  ACOS: { min: 1, max: 1, run: ([x]) => Math.acos(n(x)) },
  ATAN: { min: 1, max: 1, run: ([x]) => Math.atan(n(x)) },
  RADIANS: { min: 1, max: 1, run: ([x]) => (n(x) * Math.PI) / 180 },
  DEGREES: { min: 1, max: 1, run: ([x]) => (n(x) * 180) / Math.PI },

  // Logic (IF and IFERROR are handled lazily by the evaluator)
  AND: { min: 1, max: Infinity, run: (args) => booleansIn(args).every(Boolean) },
  OR: { min: 1, max: Infinity, run: (args) => booleansIn(args).some(Boolean) },
  NOT: { min: 1, max: 1, run: ([x]) => !toCalcBoolean(x) },

  // Text
  CONCAT: {
    min: 1,
    max: Infinity,
    run: (args) => args.flat().map((value) => toCalcText(value)).join(""),
  },
  LEN: { min: 1, max: 1, run: ([x]) => toCalcText(x).length },
  UPPER: { min: 1, max: 1, run: ([x]) => toCalcText(x).toUpperCase() },
  LOWER: { min: 1, max: 1, run: ([x]) => toCalcText(x).toLowerCase() },
  TRIM: { min: 1, max: 1, run: ([x]) => toCalcText(x).trim().replace(/\s+/g, " ") },
  LEFT: { min: 1, max: 2, run: ([x, count = 1]) => toCalcText(x).slice(0, Math.max(0, n(count))) },
  RIGHT: {
    min: 1,
    max: 2,
    run: ([x, count = 1]) => {
      const text = toCalcText(x)
      return text.slice(Math.max(0, text.length - Math.max(0, n(count))))
    },
  },
}

const LAZY = ["IF", "IFERROR"]

/** Every built-in function name, for autocomplete or docs. */
export const CALC_FUNCTION_NAMES = [...Object.keys(BUILT_INS), ...LAZY].sort()

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

type Scope = {
  variables: Map<string, { key: string; value: CalcVariable }>
  functions: Map<string, CalcFunction>
  cache: Map<string, CalcArg>
  /** Variables whose formula failed, so a sheet reports each error once. */
  failures: Map<string, CalcError>
  resolving: string[]
  dependencies: Set<string>
  references: boolean
}

function createsScope(options: CalcOptions): Scope {
  const variables = new Map<string, { key: string; value: CalcVariable }>()
  for (const [key, value] of Object.entries(options.variables ?? {})) {
    variables.set(key.toLowerCase(), { key, value })
  }
  const functions = new Map<string, CalcFunction>()
  for (const [key, run] of Object.entries(options.functions ?? {})) {
    functions.set(key.toUpperCase(), run)
  }
  return {
    variables,
    functions,
    cache: new Map(),
    failures: new Map(),
    resolving: [],
    dependencies: new Set(),
    references: options.references ?? false,
  }
}

function resolvesName(node: Node & { kind: "name" }, scope: Scope, top: boolean): CalcArg {
  // $ only pins a reference when it is copied; B$2 and B2 are the same cell.
  const name = node.reference ? node.name.replace(/\$/g, "") : node.name
  const lower = name.toLowerCase()
  const entry = scope.variables.get(lower)
  if (!entry) {
    if (node.reference && scope.references) {
      if (top) scope.dependencies.add(name.toUpperCase())
      return ""
    }
    throw new CalcError("#NAME?", `Unknown name "${node.name}".`, node)
  }
  if (top) scope.dependencies.add(entry.key)

  const cached = scope.cache.get(lower)
  if (cached !== undefined) return cached
  const failed = scope.failures.get(lower)
  if (failed) throw new CalcError(failed.code, failed.message, node)

  const { key, value } = entry
  let resolved: CalcArg
  if (typeof value === "string" && value.trimStart().startsWith("=")) {
    if (scope.resolving.includes(lower)) {
      const loop = [...scope.resolving.slice(scope.resolving.indexOf(lower)), lower]
        .map((name) => scope.variables.get(name)?.key ?? name)
        .join(" → ")
      throw new CalcError("#CIRC!", `Circular reference: ${loop}.`, node)
    }
    scope.resolving.push(lower)
    try {
      resolved = evaluatesNode(parsesFormula(value), scope, false)
    } catch (error) {
      if (!(error instanceof CalcError)) throw error
      // Point at the name here; a range inside its own formula means nothing to this one.
      const message = error.code === "#CIRC!" ? error.message : `In ${key}: ${error.message}`
      const failure = new CalcError(error.code, message, node)
      scope.failures.set(lower, failure)
      throw failure
    } finally {
      scope.resolving.pop()
    }
  } else if (typeof value === "number") {
    resolved = normalizes(value)
  } else {
    resolved = value
  }

  scope.cache.set(lower, resolved)
  return resolved
}

const MAX_RANGE_CELLS = 100_000

function readsReference(text: string) {
  const [, letters, digits] = REFERENCE_PARTS.exec(text) ?? []
  let col = 0
  for (const letter of letters.toUpperCase()) col = col * 26 + letter.charCodeAt(0) - 64
  return { col: col - 1, row: Number(digits) - 1 }
}

function columnLettersOf(index: number) {
  let letters = ""
  for (let at = index + 1; at > 0; at = Math.floor((at - 1) / 26)) {
    letters = String.fromCharCode(65 + ((at - 1) % 26)) + letters
  }
  return letters
}

/** A1:C3 as a flat list, row by row. Empty cells are left out, as SUM expects. */
function resolvesRange(node: Node & { kind: "range" }, scope: Scope, top: boolean): CalcValue[] {
  const a = readsReference(node.from)
  const b = readsReference(node.to)
  const top_ = Math.min(a.row, b.row)
  const bottom = Math.max(a.row, b.row)
  const left = Math.min(a.col, b.col)
  const right = Math.max(a.col, b.col)
  if ((bottom - top_ + 1) * (right - left + 1) > MAX_RANGE_CELLS) {
    throw new CalcError("#VALUE!", "That range is too large.", node)
  }

  const values: CalcValue[] = []
  for (let row = top_; row <= bottom; row += 1) {
    for (let col = left; col <= right; col += 1) {
      const name = `${columnLettersOf(col)}${row + 1}`
      if (top) scope.dependencies.add(scope.variables.get(name.toLowerCase())?.key ?? name)
      if (!scope.variables.has(name.toLowerCase())) continue
      const value = resolvesName(
        { kind: "name", name, reference: true, start: node.start, end: node.end },
        scope,
        false
      )
      if (Array.isArray(value)) values.push(...value)
      else if (value !== "") values.push(value)
    }
  }
  return values
}

function callsFunction(node: Node & { kind: "call" }, scope: Scope, top: boolean): CalcValue {
  const upper = node.name.toUpperCase()
  const custom = scope.functions.get(upper)
  const evaluates = (arg: Node) => evaluatesNode(arg, scope, top)

  if (!custom && upper === "IF") {
    checksArgCount(node, 2, 3)
    const [condition, then, otherwise] = node.args
    if (toCalcBoolean(evaluates(condition))) return scalarOf(evaluates(then))
    return otherwise ? scalarOf(evaluates(otherwise)) : false
  }
  if (!custom && upper === "IFERROR") {
    checksArgCount(node, 2, 2)
    try {
      return scalarOf(evaluates(node.args[0]))
    } catch (error) {
      if (!(error instanceof CalcError) || error.code === "#ERROR!") throw error
      return scalarOf(evaluates(node.args[1]))
    }
  }

  const builtIn = BUILT_INS[upper]
  if (!custom && !builtIn) {
    throw new CalcError("#NAME?", `Unknown function "${node.name}".`, {
      start: node.start,
      end: node.start + node.name.length,
    })
  }
  if (!custom) checksArgCount(node, builtIn.min, builtIn.max)

  const args = node.args.map(evaluates)
  let value: CalcValue
  try {
    value = custom ? custom(...args) : builtIn.run(args)
  } catch (error) {
    if (error instanceof CalcError) {
      if (error.start === undefined) {
        error.start = node.start
        error.end = node.end
      }
      throw error
    }
    throw new CalcError("#VALUE!", `${upper}: ${error instanceof Error ? error.message : String(error)}`, node)
  }
  if (typeof value === "number") return normalizes(value)
  if (typeof value === "string" || typeof value === "boolean") return value
  throw new CalcError("#VALUE!", `${upper} didn't return a value.`, node)
}

function checksArgCount(node: Node & { kind: "call" }, min: number, max: number) {
  const count = node.args.length
  if (count >= min && count <= max) return
  const name = node.name.toUpperCase()
  const expected =
    min === max
      ? `${min} argument${min === 1 ? "" : "s"}`
      : max === Infinity
        ? `at least ${min} argument${min === 1 ? "" : "s"}`
        : `${min} to ${max} arguments`
  throw new CalcError("#VALUE!", `${name} takes ${expected}, not ${count}.`, node)
}

function evaluatesNode(node: Node, scope: Scope, top: boolean): CalcArg {
  switch (node.kind) {
    case "number":
    case "string":
    case "boolean":
      return node.value
    case "name":
      return resolvesName(node, scope, top)
    case "range":
      return resolvesRange(node, scope, top)
    case "call":
      return callsFunction(node, scope, top)
    case "percent":
      return normalizes(toCalcNumber(evaluatesNode(node.operand, scope, top)) / 100)
    case "unary": {
      const value = toCalcNumber(evaluatesNode(node.operand, scope, top))
      return node.operator === "-" ? -value || 0 : value
    }
    case "binary": {
      const left = evaluatesNode(node.left, scope, top)
      const right = evaluatesNode(node.right, scope, top)
      try {
        return appliesOperator(node.operator, left, right)
      } catch (error) {
        if (error instanceof CalcError && error.start === undefined) {
          error.start = node.start
          error.end = node.end
        }
        throw error
      }
    }
  }
}

function appliesOperator(operator: string, left: CalcArg, right: CalcArg): CalcValue {
  if (operator === "&") return toCalcText(left) + toCalcText(right)

  if (["=", "<>", "<", ">", "<=", ">="].includes(operator)) {
    const order = compares(scalarOf(left), scalarOf(right))
    switch (operator) {
      case "=": return order === 0
      case "<>": return order !== 0
      case "<": return order < 0
      case ">": return order > 0
      case "<=": return order <= 0
      default: return order >= 0
    }
  }

  const a = toCalcNumber(left)
  const b = toCalcNumber(right)
  switch (operator) {
    case "+": return normalizes(a + b)
    case "-": return normalizes(a - b)
    case "*": return normalizes(a * b)
    case "/":
      if (b === 0) throw new CalcError("#DIV/0!", "Can't divide by zero.")
      return normalizes(a / b)
    default: {
      if (a < 0 && !Number.isInteger(b)) {
        throw new CalcError("#NUM!", "A negative number can't take a fractional power.")
      }
      return normalizes(a ** b)
    }
  }
}

/**
 * Evaluates a formula. Never throws: problems come back as
 * `{ status: "error", error }` with an Excel-style code.
 */
export function evaluatesFormula(formula: string, options: CalcOptions = {}): CalcResult {
  const trimmed = formula.trim()
  const isFormula = trimmed.startsWith("=")

  if (trimmed === "" || trimmed === "=") {
    return { status: "empty", formula, dependencies: [] }
  }
  if (options.requireEquals && !isFormula) {
    return { status: "ok", formula, value: readsLiteral(formula), dependencies: [] }
  }

  const scope = createsScope(options)
  try {
    const value = scalarOf(evaluatesNode(parsesFormula(formula), scope, true), "the result")
    return { status: "ok", formula, value, dependencies: [...scope.dependencies] }
  } catch (error) {
    const info: CalcErrorInfo =
      error instanceof CalcError
        ? {
            code: error.code,
            message: error.message,
            start: error.start,
            end: error.end,
            incomplete: error.incomplete,
          }
        : { code: "#VALUE!", message: String(error) }
    return { status: "error", formula, error: info, dependencies: [...scope.dependencies] }
  }
}

/**
 * Works out every formula among the variables at once, sharing one cache, so
 * a sheet of cells that refer to each other is evaluated once per cell.
 * Returns a result for each variable whose value is a formula.
 */
export function evaluatesVariables(options: CalcOptions = {}): Record<string, CalcResult> {
  const scope = createsScope(options)
  const results: Record<string, CalcResult> = {}

  for (const [key, formula] of Object.entries(options.variables ?? {})) {
    if (typeof formula !== "string" || !formula.trimStart().startsWith("=")) continue
    const lower = key.toLowerCase()
    scope.dependencies = new Set()
    scope.resolving = [lower]
    try {
      const failed = scope.failures.get(lower)
      if (failed) throw failed
      const value = scalarOf(evaluatesNode(parsesFormula(formula), scope, true), "the result")
      scope.cache.set(lower, value)
      results[key] = { status: "ok", formula, value, dependencies: [...scope.dependencies] }
    } catch (error) {
      const info: CalcErrorInfo =
        error instanceof CalcError
          ? { code: error.code, message: error.message, start: error.start, end: error.end, incomplete: error.incomplete }
          : { code: "#VALUE!", message: String(error) }
      if (error instanceof CalcError) {
        const message = error.code === "#CIRC!" ? error.message : `In ${key}: ${error.message}`
        scope.failures.set(lower, new CalcError(error.code, message))
      }
      results[key] = { status: "error", formula, error: info, dependencies: [...scope.dependencies] }
    }
  }

  return results
}

/**
 * Turns a result back into text that evaluates to the same value, e.g. to
 * replace `=2*21` with `42` when the field commits.
 */
export function toFormulaText(value: CalcValue, requireEquals = false) {
  if (typeof value === "string") {
    return requireEquals ? value : `"${value.replace(/"/g, '""')}"`
  }
  return formatsCalcValue(value)
}
