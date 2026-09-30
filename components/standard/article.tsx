import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// Page-level layout. Header, aside and footer sit at the reading measure;
// ArticleContent is a breakout grid so figures and sections can step out to
// "wide" or "full" width. Sidebar layouts only kick in once the container
// is wide enough — below that everything stacks in DOM order.
const articleVariants = cva("grid w-full gap-x-12 gap-y-10", {
  variants: {
    layout: {
      // One centered reading column.
      single: "grid-cols-[minmax(0,1fr)]",
      // Content with an aside on the end (table of contents, related links).
      sidebar:
        "@4xl:grid-cols-[minmax(0,1fr)_var(--article-aside-width)] @4xl:[grid-template-areas:'header_header''content_aside''footer_footer']",
      // Aside on the start, content on the end.
      "sidebar-start":
        "@4xl:grid-cols-[var(--article-aside-width)_minmax(0,1fr)] @4xl:[grid-template-areas:'header_header''aside_content''footer_footer']",
    },
    measure: {
      narrow: "[--article-measure:36rem]",
      default: "[--article-measure:42rem]",
      wide: "[--article-measure:52rem]",
    },
  },
  compoundVariants: [
    {
      layout: ["sidebar", "sidebar-start"],
      className:
        "@4xl:[--article-inset:0px] @4xl:[--article-measure:100%] @4xl:[&>[data-slot=article-aside]]:[grid-area:aside] @4xl:[&>[data-slot=article-content]]:[grid-area:content] @4xl:[&>[data-slot=article-footer]]:[grid-area:footer] @4xl:[&>[data-slot=article-header]]:[grid-area:header]",
    },
  ],
  defaultVariants: {
    layout: "single",
    measure: "default",
  },
})

function Article({
  className,
  layout = "single",
  measure = "default",
  ...props
}: React.ComponentProps<"article"> & VariantProps<typeof articleVariants>) {
  return (
    <div data-slot="article-container" className="@container w-full min-w-0">
      <article
        data-slot="article"
        data-layout={layout}
        className={cn(
          articleVariants({ layout, measure }),
          "[--article-aside-width:14rem] [--article-inset:8rem]",
          className
        )}
        {...props}
      />
    </div>
  )
}

// Everything outside ArticleContent lines up with the reading measure.
const measured = "mx-auto w-full min-w-0 max-w-(--article-measure)"

function ArticleHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="article-header"
      className={cn(measured, "flex flex-col gap-3", className)}
      {...props}
    />
  )
}

function ArticleEyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="article-eyebrow"
      className={cn("text-sm font-medium text-primary", className)}
      {...props}
    />
  )
}

function ArticleTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="article-title"
      className={cn(
        "scroll-m-20 text-4xl font-semibold tracking-tight text-balance @2xl:text-5xl",
        className
      )}
      {...props}
    />
  )
}

function ArticleLead({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="article-lead"
      className={cn("text-xl text-pretty text-muted-foreground", className)}
      {...props}
    />
  )
}

function ArticleMeta({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="article-meta"
      className={cn(
        "mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

// Plain markup (no class) gets reading styles, so Markdown/CMS output looks
// right. Anything with its own classes is left alone.
const proseStyles = [
  "[&_h2:not([class])]:mt-6 [&_h2:not([class])]:scroll-m-20 [&_h2:not([class])]:text-2xl [&_h2:not([class])]:font-semibold [&_h2:not([class])]:tracking-tight",
  "[&_h3:not([class])]:mt-3 [&_h3:not([class])]:scroll-m-20 [&_h3:not([class])]:text-xl [&_h3:not([class])]:font-semibold",
  "[&_p:not([class])]:leading-7 [&_p:not([class])]:text-pretty",
  "[&_ul:not([class])]:list-disc [&_ul:not([class])]:space-y-2 [&_ul:not([class])]:pl-6",
  "[&_ol:not([class])]:list-decimal [&_ol:not([class])]:space-y-2 [&_ol:not([class])]:pl-6",
  "[&_li:not([class])]:leading-7 [&_li:not([class])]:marker:text-muted-foreground",
  "[&_blockquote:not([class])]:border-l-2 [&_blockquote:not([class])]:pl-6 [&_blockquote:not([class])]:text-lg [&_blockquote:not([class])]:italic",
  "[&_a:not([class])]:font-medium [&_a:not([class])]:underline [&_a:not([class])]:underline-offset-4",
  "[&_code:not([class])]:rounded-md [&_code:not([class])]:bg-muted [&_code:not([class])]:px-1.5 [&_code:not([class])]:py-0.5 [&_code:not([class])]:font-mono [&_code:not([class])]:text-[0.875em]",
  "[&_hr:not([class])]:my-4 [&_hr:not([class])]:border-border",
].join(" ")

// Named lines let any direct child pick a width through --article-col:
// full | wide | content (default).
const breakoutColumns =
  "[full-start] minmax(0,1fr) [wide-start] minmax(0,var(--article-inset)) [content-start] min(var(--article-measure),100%) [content-end] minmax(0,var(--article-inset)) [wide-end] minmax(0,1fr) [full-end]"

function ArticleContent({
  className,
  style,
  prose = true,
  ...props
}: React.ComponentProps<"div"> & {
  /** Style unclassed headings, paragraphs, lists, quotes, links and code. */
  prose?: boolean
}) {
  return (
    <div
      data-slot="article-content"
      className={cn(
        "@container grid min-w-0 gap-x-0 gap-y-5 [&>*]:min-w-0 [&>*]:[grid-column:var(--article-col,content)] [&>[data-slot=article-section][data-layout=stack]]:[grid-column:full]",
        prose && proseStyles,
        className
      )}
      style={{ gridTemplateColumns: breakoutColumns, ...style }}
      {...props}
    />
  )
}

const bleedColumn = {
  none: "[--article-col:content]",
  wide: "[--article-col:wide]",
  full: "[--article-col:full]",
} as const

type ArticleBleed = keyof typeof bleedColumn

const articleSectionVariants = cva("min-w-0", {
  variants: {
    layout: {
      // Spans the full content grid as a subgrid, so its children can still
      // bleed on their own.
      stack:
        "grid grid-cols-subgrid gap-y-5 [&>*]:min-w-0 [&>*]:[grid-column:var(--article-col,content)]",
      // Title across the top, then two panes side by side.
      split:
        "grid gap-x-10 gap-y-5 @2xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] [&>[data-slot=article-section-title]]:col-span-full",
      // Same as split with the panes swapped.
      "split-reverse":
        "grid gap-x-10 gap-y-5 @2xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] [&>[data-slot=article-section-title]]:col-span-full @2xl:[&>[data-slot=article-section-title]]:-order-2 @2xl:[&>:last-child]:-order-1",
    },
  },
  defaultVariants: {
    layout: "stack",
  },
})

function ArticleSection({
  className,
  layout = "stack",
  bleed,
  ...props
}: React.ComponentProps<"section"> &
  VariantProps<typeof articleSectionVariants> & {
    /** Width of a split section. Defaults to "wide". Ignored by "stack". */
    bleed?: ArticleBleed
  }) {
  const split = layout !== "stack"

  return (
    <section
      data-slot="article-section"
      data-layout={layout}
      className={cn(
        articleSectionVariants({ layout }),
        split && bleedColumn[bleed ?? "wide"],
        className
      )}
      {...props}
    />
  )
}

function ArticleSectionTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="article-section-title"
      className={cn(
        "mt-6 scroll-m-20 text-3xl font-semibold tracking-tight text-balance",
        className
      )}
      {...props}
    />
  )
}

const articleFigureVariants = cva(
  "flex flex-col gap-3 [&_img]:w-full [&_img]:object-cover [&_video]:w-full",
  {
    variants: {
      bleed: {
        none: bleedColumn.none,
        wide: bleedColumn.wide,
        full: `${bleedColumn.full} [&_[data-slot=image]]:rounded-none [&_img]:rounded-none`,
      },
    },
    defaultVariants: {
      bleed: "none",
    },
  }
)

function ArticleFigure({
  className,
  bleed = "none",
  ...props
}: React.ComponentProps<"figure"> & VariantProps<typeof articleFigureVariants>) {
  return (
    <figure
      data-slot="article-figure"
      data-bleed={bleed}
      className={cn(articleFigureVariants({ bleed }), "my-2", className)}
      {...props}
    />
  )
}

function ArticleFigureCaption({
  className,
  ...props
}: React.ComponentProps<"figcaption">) {
  return (
    <figcaption
      data-slot="article-figure-caption"
      className={cn(
        "text-sm text-pretty text-muted-foreground [[data-bleed=full]_&]:px-4",
        className
      )}
      {...props}
    />
  )
}

function ArticleAside({
  className,
  sticky = true,
  ...props
}: React.ComponentProps<"aside"> & {
  /** Stick to the top while the content scrolls (sidebar layouts only). */
  sticky?: boolean
}) {
  return (
    <aside
      data-slot="article-aside"
      className={cn(
        measured,
        "flex flex-col gap-3 self-start text-sm",
        sticky &&
          "@4xl:[[data-layout^=sidebar]>&]:sticky @4xl:[[data-layout^=sidebar]>&]:top-(--article-sticky-top,1rem)",
        className
      )}
      {...props}
    />
  )
}

function ArticleFooter({ className, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer
      data-slot="article-footer"
      className={cn(
        measured,
        "flex flex-wrap items-center gap-3 border-t border-border pt-6 text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Article,
  ArticleAside,
  ArticleContent,
  ArticleEyebrow,
  ArticleFigure,
  ArticleFigureCaption,
  ArticleFooter,
  ArticleHeader,
  ArticleLead,
  ArticleMeta,
  ArticleSection,
  ArticleSectionTitle,
  ArticleTitle,
  articleFigureVariants,
  articleSectionVariants,
  articleVariants,
}
