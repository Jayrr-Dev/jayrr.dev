"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { PipetteIcon } from "lucide-react"
import { cn } from "cn"

import { useControllableState } from "@/hooks/use-controllable-state"

/**
 * A color field built on the browser's own color picker: a swatch that
 * opens the native picker, a hex field, optional preset swatches, and an
 * eyedropper where the browser has one (Chrome and Edge on desktop).
 * Values are lowercase #rrggbb, the format the native picker uses.
 *
 * <ColorPicker defaultValue="#6366f1" />
 * <ColorPicker value={color} onValueChange={setColor} swatches={["#ef4444", "#22c55e"]} />
 */

const colorPickerVariants = cva(
  "inline-flex max-w-full items-center gap-1 rounded-lg border border-input bg-background p-1 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-disabled:pointer-events-none has-disabled:opacity-50 dark:bg-input/30",
  {
    variants: {
      size: {
        sm: "h-8 text-xs [--swatch:1.5rem]",
        default: "h-9 text-sm [--swatch:1.75rem]",
        lg: "h-11 text-base [--swatch:2.25rem]",
      },
    },
    defaultVariants: { size: "default" },
  }
)

type EyeDropperResult = { sRGBHex: string }
type EyeDropperConstructor = new () => { open: () => Promise<EyeDropperResult> }

function getEyeDropper() {
  return (window as unknown as { EyeDropper?: EyeDropperConstructor })
    .EyeDropper
}

const noSubscribe = () => () => {}

/** #rgb, #rrggbb, rgb or rrggbb to lowercase #rrggbb; anything else to null. */
function normalizeHex(input: string) {
  const hex = input.trim().replace(/^#/, "").toLowerCase()
  if (/^[0-9a-f]{3}$/.test(hex)) {
    return `#${hex
      .split("")
      .map((char) => char + char)
      .join("")}`
  }
  if (/^[0-9a-f]{6}$/.test(hex)) return `#${hex}`
  return null
}

/** Only a valid hex reaches the native input; it rejects anything else. */
function toColorValue(value: string) {
  return normalizeHex(value) ?? "#000000"
}

function ColorPicker({
  className,
  value: valueProp,
  defaultValue = "#6366f1",
  onValueChange,
  swatches,
  showInput = true,
  eyedropper = true,
  size = "default",
  disabled = false,
  name,
  id,
  "aria-label": ariaLabel = "Color",
  ...props
}: Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> &
  VariantProps<typeof colorPickerVariants> & {
    /** A hex color. Pass it to control the picker. */
    value?: string
    defaultValue?: string
    /** Fires with lowercase #rrggbb, continuously while dragging in the native picker. */
    onValueChange?: (value: string) => void
    /** Preset colors shown after the field. */
    swatches?: string[]
    /** Show the hex text field. */
    showInput?: boolean
    /** Offer the eyedropper where the browser supports it. */
    eyedropper?: boolean
    disabled?: boolean
    /** Submits the hex value with a form. */
    name?: string
    /** Id of the hex field, for a label's htmlFor. */
    id?: string
  }) {
  const [value, setValue] = useControllableState({
    value: valueProp === undefined ? undefined : toColorValue(valueProp),
    defaultValue: toColorValue(defaultValue),
    onChange: onValueChange,
  })
  // What the person is typing; null while the field isn't being edited.
  const [draft, setDraft] = React.useState<string | null>(null)
  const canEyedrop = React.useSyncExternalStore(
    noSubscribe,
    () => Boolean(getEyeDropper()),
    () => false
  )
  const invalid = draft !== null && normalizeHex(draft) === null

  const pick = async () => {
    const EyeDropper = getEyeDropper()
    if (!EyeDropper) return
    try {
      const result = await new EyeDropper().open()
      const next = normalizeHex(result.sRGBHex)
      if (next) setValue(next)
    } catch {
      // Dismissed with Escape.
    }
  }

  return (
    <div
      data-slot="color-picker"
      className={cn("flex max-w-full flex-wrap items-center gap-2", className)}
      {...props}
    >
      <div className={colorPickerVariants({ size })}>
        <span
          data-slot="color-picker-swatch"
          className="relative size-(--swatch) shrink-0 overflow-hidden rounded-md shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)] has-focus-visible:ring-2 has-focus-visible:ring-ring dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.15)]"
          style={{ backgroundColor: value }}
        >
          {/* The native input fills the swatch, so clicking it opens the browser picker. */}
          <input
            type="color"
            value={value}
            disabled={disabled}
            aria-label={`${ariaLabel}: open color picker`}
            onChange={(event) => {
              setDraft(null)
              setValue(event.target.value.toLowerCase())
            }}
            className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
        </span>

        {showInput ? (
          <input
            id={id}
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            maxLength={7}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-invalid={invalid || undefined}
            value={draft ?? value}
            onChange={(event) => {
              const next = event.target.value
              setDraft(next)
              const hex = normalizeHex(next)
              // Three digits are also the start of six, so wait for blur to expand them.
              if (hex && next.replace(/^#/, "").length === 6) setValue(hex)
            }}
            onBlur={() => {
              const hex = draft === null ? null : normalizeHex(draft)
              if (hex) setValue(hex)
              setDraft(null)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur()
              if (event.key === "Escape") setDraft(null)
            }}
            className={cn(
              "h-full w-[calc(7ch+0.75rem)] min-w-0 bg-transparent px-1 font-mono uppercase tabular-nums outline-none",
              invalid && "text-destructive"
            )}
          />
        ) : null}

        {eyedropper && canEyedrop ? (
          <button
            type="button"
            disabled={disabled}
            onClick={pick}
            aria-label="Pick a color from the screen"
            title="Pick from screen"
            className="flex size-(--swatch) shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
          >
            <PipetteIcon />
          </button>
        ) : null}
      </div>

      {swatches?.length ? (
        <div
          role="group"
          aria-label="Preset colors"
          className="flex flex-wrap items-center gap-1"
        >
          {swatches.map((swatch) => {
            const hex = normalizeHex(swatch)
            if (!hex) return null
            const selected = hex === value
            return (
              <button
                key={hex}
                type="button"
                disabled={disabled}
                aria-label={hex}
                aria-pressed={selected}
                title={hex}
                onClick={() => {
                  setDraft(null)
                  setValue(hex)
                }}
                className={cn(
                  "size-6 rounded-md shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)] transition-transform outline-none hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.15)]",
                  selected &&
                    "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                )}
                style={{ backgroundColor: hex }}
              />
            )
          })}
        </div>
      ) : null}

      {name ? <input type="hidden" name={name} value={value} /> : null}
    </div>
  )
}

export { ColorPicker, colorPickerVariants, normalizeHex }
