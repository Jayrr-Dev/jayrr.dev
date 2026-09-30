"use client"

import * as React from "react"
import { CheckIcon, CopyIcon, MailIcon } from "lucide-react"

import { Button } from "@/components/standard/button"

/**
 * Starts an email: a `mailto:` link with the recipients, subject and body
 * filled in, opened in the visitor's mail app. With `action="copy"` it copies
 * the address instead, for visitors with no mail app set up.
 *
 * <EmailButton to="hello@jayrr.dev" subject="Project enquiry" />
 * <EmailButton to="hello@jayrr.dev" action="copy" />
 * <EmailButton iconOnly to={["a@x.dev", "b@x.dev"]} cc="team@x.dev" body={draft} />
 */

type EmailAction = "compose" | "copy"

type EmailButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "href" | "onClick" | "download"
> & {
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  subject?: string
  body?: string
  /** "compose" opens the mail app; "copy" copies the address. */
  action?: EmailAction
  /** Label shown for a moment after the address is copied. */
  copiedLabel?: React.ReactNode
  onEmail?: (action: EmailAction) => void
  onEmailError?: (error: unknown) => void
}

const COPIED_MS = 2000

function joinsAddresses(addresses: string | string[] | undefined) {
  return (Array.isArray(addresses) ? addresses : [addresses ?? ""])
    .map((address) => address.trim())
    .filter(Boolean)
    .join(",")
}

/** Builds a mailto URL; fields are percent-encoded so spaces stay %20, not +. */
function buildsMailto({
  to,
  cc,
  bcc,
  subject,
  body,
}: Pick<EmailButtonProps, "to" | "cc" | "bcc" | "subject" | "body">) {
  const fields = [
    ["cc", joinsAddresses(cc)],
    ["bcc", joinsAddresses(bcc)],
    ["subject", subject ?? ""],
    ["body", body ?? ""],
  ]
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
  const recipients = joinsAddresses(to)
    .split(",")
    // Keep "@" readable; some mail apps don't decode %40 in the address.
    .map((address) => encodeURIComponent(address).replace(/%40/g, "@"))
    .join(",")

  return `mailto:${recipients}${fields.length ? `?${fields.join("&")}` : ""}`
}

function EmailButton({
  to,
  cc,
  bcc,
  subject,
  body,
  action = "compose",
  copiedLabel = "Copied",
  onEmail,
  onEmailError,
  iconOnly = false,
  tone = "outline",
  children,
  ...props
}: EmailButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<number | undefined>(undefined)

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  const address = joinsAddresses(to)
  const copying = action === "copy"

  async function copiesAddress() {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), COPIED_MS)
      onEmail?.("copy")
    } catch (error) {
      onEmailError?.(error)
    }
  }

  const icon = copied ? (
    <CheckIcon aria-hidden className="size-4" />
  ) : copying ? (
    <CopyIcon aria-hidden className="size-4" />
  ) : (
    <MailIcon aria-hidden className="size-4" />
  )
  const name = copying ? `Copy ${address}` : `Email ${address}`

  return (
    <>
      <Button
        data-slot="email-button"
        data-action={action}
        data-copied={copied || undefined}
        tone={tone}
        iconOnly={iconOnly}
        aria-label={iconOnly ? name : undefined}
        title={iconOnly ? name : undefined}
        leading={iconOnly ? undefined : icon}
        href={
          copying ? undefined : buildsMailto({ to, cc, bcc, subject, body })
        }
        onClick={copying ? copiesAddress : () => onEmail?.("compose")}
        {...props}
      >
        {iconOnly
          ? icon
          : copied
            ? copiedLabel
            : (children ?? (copying ? address : "Email"))}
      </Button>
      {copying ? (
        <span role="status" className="sr-only">
          {copied ? "Email address copied" : ""}
        </span>
      ) : null}
    </>
  )
}

export { EmailButton, type EmailAction }
