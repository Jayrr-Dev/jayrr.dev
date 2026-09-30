"use client"

import { useRef, useState } from "react"

import { Button } from "@/components/standard/button"
import {
  CalcError,
  evaluatesFormula,
  InputCalculator,
  InputCalculatorHighlight,
  InputCalculatorInput,
  InputCalculatorResult,
  toCalcNumber,
  type CalcArg,
  type CalcResult,
  type InputCalculatorProps,
} from "@/components/standard/input-calculator"
import { NumberInput } from "@/components/standard/number-input"
import { Switch } from "@/components/standard/switch"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

/** The headless parts ship unstyled; this is one way to dress them. */
const TOKEN_COLORS =
  "[&_[data-token=equals]]:text-muted-foreground [&_[data-token=number]]:text-sky-600 dark:[&_[data-token=number]]:text-sky-400 [&_[data-token=string]]:text-amber-600 dark:[&_[data-token=string]]:text-amber-400 [&_[data-token=boolean]]:text-violet-600 dark:[&_[data-token=boolean]]:text-violet-400 [&_[data-token=name]]:text-emerald-600 dark:[&_[data-token=name]]:text-emerald-400 [&_[data-token=function]]:font-semibold [&_[data-token=function]]:text-fuchsia-600 dark:[&_[data-token=function]]:text-fuchsia-400 [&_[data-token=operator]]:text-muted-foreground [&_[data-token=percent]]:text-muted-foreground [&_[data-token=paren]]:text-muted-foreground [&_[data-error=invalid]]:underline [&_[data-error=invalid]]:decoration-destructive [&_[data-error=invalid]]:decoration-wavy"

function RendersCalcField({
  placeholder,
  ...props
}: Omit<InputCalculatorProps, "children" | "className"> & {
  placeholder?: string
}) {
  const highlight = useRef<HTMLSpanElement>(null)

  return (
    <InputCalculator {...props} className="flex w-full items-center gap-2">
      <div className="grid h-9 min-w-0 flex-1 items-center overflow-hidden rounded-lg border border-input font-mono text-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-data-locked:border-dashed has-[[aria-invalid=true]]:border-destructive dark:bg-input/30">
        <InputCalculatorHighlight
          ref={highlight}
          className={`pointer-events-none col-start-1 row-start-1 px-2.5 whitespace-pre ${TOKEN_COLORS}`}
        />
        <InputCalculatorInput
          placeholder={placeholder}
          aria-label="Formula"
          className="col-start-1 row-start-1 h-full w-full bg-transparent px-2.5 text-transparent caret-foreground outline-none placeholder:text-muted-foreground"
          onScroll={(event) => {
            if (highlight.current) {
              highlight.current.style.transform = `translateX(${-event.currentTarget.scrollLeft}px)`
            }
          }}
        />
      </div>
      <InputCalculatorResult
        placeholder="—"
        className="min-w-16 shrink-0 rounded-md bg-muted px-2 py-1 text-right font-mono text-sm tabular-nums data-incomplete:text-muted-foreground data-[status=error]:not-data-incomplete:bg-destructive/10 data-[status=error]:not-data-incomplete:text-destructive"
      />
    </InputCalculator>
  )
}

function RendersBasicCard() {
  return (
    <RendersDemoCard label="formula · live result">
      <div className="flex w-full flex-col gap-2">
        <RendersCalcField
          defaultValue="=12 * (3 + 4.5) / 2"
          placeholder="Type a formula, e.g. 2 * (3 + 4)"
        />
        <p className="text-xs text-muted-foreground">
          The leading = is optional. Try <code>0.1 + 0.2</code>,{" "}
          <code>15% * 80</code>, <code>SQRT(2) ^ 2</code> or{" "}
          <code>ROUND(PI(), 3)</code>.
        </p>
      </div>
    </RendersDemoCard>
  )
}

function RendersVariablesCard() {
  const [price, setPrice] = useState(24.5)
  const [qty, setQty] = useState(3)
  const [tax, setTax] = useState(0.0825)
  const [dependencies, setDependencies] = useState<string[]>([])
  const [locked, setLocked] = useState(true)
  const variables = {
    price,
    qty,
    tax,
    // A string starting with "=" is a formula of its own.
    subtotal: "=price * qty",
  }

  return (
    <RendersDemoCard label="variables · derived names">
      <div className="flex w-full flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          <NumberInput label="price" value={price} onChange={setPrice} compact />
          <NumberInput label="qty" value={qty} onChange={setQty} compact />
          <NumberInput label="tax" value={tax} onChange={setTax} compact />
        </div>
        <RendersCalcField
          variables={variables}
          locked={locked}
          defaultValue="=ROUND(subtotal * (1 + tax), 2)"
          onResult={(result) => setDependencies(result.dependencies)}
        />
        <div className="flex flex-wrap gap-1.5 font-mono text-xs">
          {Object.entries(variables).map(([name, value]) => (
            <span
              key={name}
              className={
                dependencies.includes(name)
                  ? "rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-700 dark:text-emerald-300"
                  : "rounded bg-muted px-1.5 py-0.5 text-muted-foreground"
              }
            >
              {name} = {String(value)}
            </span>
          ))}
        </div>
        <Switch
          size="sm"
          label="Lock formula"
          checked={locked}
          onCheckedChange={setLocked}
        />
      </div>
    </RendersDemoCard>
  )
}

function RendersCellCard() {
  const [log, setLog] = useState<string[]>([])

  return (
    <RendersDemoCard label="spreadsheet cell · resolve on enter">
      <div className="flex w-full flex-col gap-2">
        <RendersCalcField
          requireEquals
          resolveOnCommit
          defaultValue="=40 * 1.5"
          onCommit={(result: CalcResult) =>
            setLog((lines) =>
              [
                `${result.formula.trim() || "(empty)"} → ${
                  result.status === "ok"
                    ? String(result.value)
                    : result.status === "error"
                      ? result.error.code
                      : "—"
                }`,
                ...lines,
              ].slice(0, 3)
            )
          }
        />
        <p className="text-xs text-muted-foreground">
          Only text starting with = is maths; <code>Total</code> stays text.
          Enter swaps the formula for its value, Escape undoes an edit.
        </p>
        {log.length > 0 && (
          <ul className="font-mono text-xs text-muted-foreground">
            {log.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        )}
      </div>
    </RendersDemoCard>
  )
}

const functions = {
  /** TIP(amount, [rate]) — custom functions get plain values. */
  TIP: (amount: CalcArg, rate: CalcArg = 0.18) => {
    const value = toCalcNumber(amount)
    if (value < 0) throw new CalcError("#NUM!", "TIP needs a positive amount.")
    return value * toCalcNumber(rate)
  },
}

const SAMPLES = [
  "=TIP(86.4) + 86.4",
  '=IF(TIP(50) > 8, "generous", "fair")',
  "=IFERROR(1 / 0, 0)",
  "=1 / 0",
  "=bill * 2",
  "=SUM(1, 2",
]

function RendersFunctionsCard() {
  const [formula, setFormula] = useState(SAMPLES[0])
  const result = evaluatesFormula(formula, { functions })

  return (
    <RendersDemoCard label="custom functions · errors">
      <div className="flex w-full flex-col gap-3">
        <RendersCalcField
          functions={functions}
          value={formula}
          onValueChange={setFormula}
        />
        <div className="flex flex-wrap gap-1.5">
          {SAMPLES.map((sample) => (
            <Button
              key={sample}
              tone="outline"
              size="xs"
              className="font-mono"
              onClick={() => setFormula(sample)}
            >
              {sample}
            </Button>
          ))}
        </div>
        {result.status === "error" ? (
          <p className="text-xs text-destructive">
            {result.error.code} {result.error.message}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            The engine also runs on its own: evaluatesFormula(text, options).
          </p>
        )}
      </div>
    </RendersDemoCard>
  )
}

export function RendersInputCalculatorDemo() {
  return (
    <>
      <RendersBasicCard />
      <RendersVariablesCard />
      <RendersCellCard />
      <RendersFunctionsCard />
    </>
  )
}
