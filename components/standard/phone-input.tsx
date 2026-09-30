"use client"

import * as React from "react"
import { ChevronDownIcon, GlobeIcon } from "lucide-react"
import * as RPNInput from "react-phone-number-input"
import flags from "react-phone-number-input/flags"
import { cn } from "cn"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { FieldLabel } from "@/components/standard/field-label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/standard/popover"
import { TextField } from "@/components/standard/text-field"

type PhoneInputSize = "sm" | "default" | "lg"

const TRIGGER_SIZE_CLASSES: Record<PhoneInputSize, string> = {
  sm: "h-7 px-2",
  default: "h-8 px-2.5",
  lg: "h-9 px-3",
}

type PhoneInputProps = Omit<
  React.ComponentProps<typeof TextField>,
  | "value"
  | "defaultValue"
  | "onChange"
  | "type"
  | "size"
  | "ref"
  | "completion"
  | "completionKeys"
  | "ghost"
> & {
  /** E.164 number, e.g. "+12125551234". Empty is undefined. */
  value?: RPNInput.Value
  onChange?: (value: RPNInput.Value | undefined) => void
  /** Country used until the number says otherwise. */
  defaultCountry?: RPNInput.Country
  /** Limits the picker to these countries. */
  countries?: RPNInput.Country[]
  onCountryChange?: (country: RPNInput.Country | undefined) => void
  /** Keeps the +code in the field. The placeholder then never shows. */
  international?: boolean
  label?: string
  size?: PhoneInputSize
  /** Pill ends instead of rounded corners. */
  shape?: "default" | "pill"
}

/**
 * Phone number field with a searchable country picker. Formats as you type
 * and reports the number in E.164 ("+12125551234"), or undefined when empty.
 * Check it with isValidPhoneNumber, re-exported from here.
 */
function PhoneInput({
  value,
  onChange,
  defaultCountry,
  countries,
  onCountryChange,
  international = false,
  label,
  size = "default",
  shape = "default",
  disabled,
  readOnly,
  className,
  containerClassName,
  id,
  ...props
}: PhoneInputProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const pill = shape === "pill"

  const input = (
    <RPNInput.default
      {...props}
      id={inputId}
      value={value}
      onChange={(next) => onChange?.(next || undefined)}
      defaultCountry={defaultCountry}
      countries={countries}
      onCountryChange={onCountryChange}
      disabled={disabled}
      readOnly={readOnly}
      international={international}
      addInternationalOption={false}
      flagComponent={PhoneFlag}
      countrySelectComponent={PhoneCountrySelect}
      countrySelectProps={{ size, pill }}
      inputComponent={TextField}
      numberInputProps={{
        size,
        className: cn(
          "rounded-s-none tabular-nums",
          pill && "rounded-e-full",
          className
        ),
      }}
      data-slot="phone-input"
      className={cn("group/phone flex w-full", containerClassName)}
    />
  )

  if (!label) return input

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={inputId} className="text-xs text-muted-foreground">
        {label}
      </FieldLabel>
      {input}
    </div>
  )
}

type CountryOption = { value?: RPNInput.Country; label: string }

/** cmdk matches the search against this, so it holds the name and ISO code. */
function countryItemValue(option?: CountryOption) {
  return option ? `${option.label} ${option.value}` : ""
}

type PhoneCountrySelectProps = {
  value?: RPNInput.Country
  onChange: (country: RPNInput.Country | undefined) => void
  options: CountryOption[]
  disabled?: boolean
  readOnly?: boolean
  size: PhoneInputSize
  pill: boolean
}

function PhoneCountrySelect({
  value,
  onChange,
  options,
  disabled,
  readOnly,
  size,
  pill,
}: PhoneCountrySelectProps) {
  const [open, setOpen] = React.useState(false)
  const selected = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="phone-input-country"
          aria-label={selected ? `Country: ${selected.label}` : "Country"}
          disabled={disabled || readOnly}
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-s-lg border border-e-0 border-input bg-transparent transition-colors outline-none hover:bg-muted/60 focus-visible:z-10 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:bg-input/30",
            "group-has-[input:disabled]/phone:opacity-50 group-has-[input[aria-invalid=true]]/phone:border-destructive",
            TRIGGER_SIZE_CLASSES[size],
            pill && "rounded-s-full ps-3"
          )}
        >
          <PhoneFlag country={value} countryName={selected?.label ?? ""} />
          {readOnly ? null : (
            <ChevronDownIcon className="size-3.5 text-muted-foreground" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <Command defaultValue={value ? countryItemValue(selected) : undefined}>
          <CommandInput placeholder="Search country…" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) =>
                option.value ? (
                  <CommandItem
                    key={option.value}
                    value={countryItemValue(option)}
                    keywords={[
                      `+${RPNInput.getCountryCallingCode(option.value)}`,
                    ]}
                    data-checked={option.value === value}
                    onSelect={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                  >
                    <PhoneFlag
                      country={option.value}
                      countryName={option.label}
                    />
                    <span className="flex-1 truncate">{option.label}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      +{RPNInput.getCountryCallingCode(option.value)}
                    </span>
                  </CommandItem>
                ) : null
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function PhoneFlag({
  country,
  countryName,
}: {
  country?: RPNInput.Country
  countryName: string
}) {
  const Flag = country ? flags[country] : undefined

  return (
    <span className="flex h-3.5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[2px] [&_svg]:size-full">
      {Flag ? (
        <Flag title={countryName} />
      ) : (
        <GlobeIcon className="text-muted-foreground" />
      )}
    </span>
  )
}

const { isValidPhoneNumber, formatPhoneNumberIntl } = RPNInput

export { formatPhoneNumberIntl, isValidPhoneNumber, PhoneInput }
