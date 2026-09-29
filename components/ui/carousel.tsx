"use client"

import * as React from "react"
import { cn } from "cn"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"

import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
  canScrollPrev: boolean
  canScrollNext: boolean
  selectedIndex: number
  snapCount: number
} & CarouselProps

type CarouselControlPosition = "outside" | "inside"
type CarouselControlAppearance = "button" | "gradient"
type CarouselControlReveal = "always" | "hover" | "side"

type CarouselControlProps = {
  position?: CarouselControlPosition
  appearance?: CarouselControlAppearance
  reveal?: CarouselControlReveal
  /** Show the chevron on a `gradient` control. Buttons always show it. */
  arrow?: boolean
}

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [snapCount, setSnapCount] = React.useState(0)
  const [hoverSide, setHoverSide] = React.useState<"prev" | "next" | null>(
    null
  )

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
    setSelectedIndex(api.selectedScrollSnap())
    setSnapCount(api.scrollSnapList().length)
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index)
    },
    [api]
  )

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const isPrev =
        orientation === "horizontal"
          ? event.clientX - rect.left < rect.width / 2
          : event.clientY - rect.top < rect.height / 2
      setHoverSide(isPrev ? "prev" : "next")
    },
    [orientation]
  )

  // At the start or end, hovering the dead side reveals the other one so
  // there is always a hint of which way the carousel can still go.
  let revealSide = hoverSide
  if (revealSide === "prev" && !canScrollPrev && canScrollNext) {
    revealSide = "next"
  } else if (revealSide === "next" && !canScrollNext && canScrollPrev) {
    revealSide = "prev"
  }

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("reInit", onSelect)
      api?.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        snapCount,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverSide(null)}
        data-hover-side={revealSide ?? undefined}
        className={cn("group/carousel relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
}

const controlRevealClasses: Record<
  CarouselControlReveal,
  Record<"prev" | "next", string>
> = {
  always: { prev: "", next: "" },
  hover: {
    prev: "opacity-0 group-hover/carousel:opacity-100",
    next: "opacity-0 group-hover/carousel:opacity-100",
  },
  side: {
    prev: "opacity-0 group-data-[hover-side=prev]/carousel:opacity-100",
    next: "opacity-0 group-data-[hover-side=next]/carousel:opacity-100",
  },
}

function carouselControlClasses({
  direction,
  orientation,
  position,
  appearance,
  reveal,
}: {
  direction: "prev" | "next"
  orientation: CarouselProps["orientation"]
  position: CarouselControlPosition
  appearance: CarouselControlAppearance
  reveal: CarouselControlReveal
}) {
  const isHorizontal = orientation === "horizontal"
  const isPrev = direction === "prev"
  let placement: string

  if (appearance === "gradient") {
    placement = cn(
      "flex items-center justify-center from-black/70 to-transparent text-white",
      isHorizontal ? "inset-y-0 w-14" : "inset-x-0 h-14 [&_svg]:rotate-90",
      isHorizontal && isPrev && "left-0 rounded-l-lg bg-linear-to-r",
      isHorizontal && !isPrev && "right-0 rounded-r-lg bg-linear-to-l",
      !isHorizontal && isPrev && "top-0 rounded-t-lg bg-linear-to-b",
      !isHorizontal && !isPrev && "bottom-0 rounded-b-lg bg-linear-to-t"
    )
  } else if (position === "inside") {
    placement = cn(
      "rounded-full bg-background/80 shadow-sm backdrop-blur-sm",
      isHorizontal
        ? cn("inset-y-0 my-auto", isPrev ? "left-2" : "right-2")
        : cn(
            "left-1/2 -translate-x-1/2 rotate-90",
            isPrev ? "top-2" : "bottom-2"
          )
    )
  } else {
    placement = cn(
      "rounded-full",
      isHorizontal
        ? cn("inset-y-0 my-auto", isPrev ? "-left-12" : "-right-12")
        : cn(
            "left-1/2 -translate-x-1/2 rotate-90",
            isPrev ? "-top-12" : "-bottom-12"
          )
    )
  }

  const isRevealed = reveal !== "always"

  return cn(
    "absolute z-10 touch-manipulation transition-opacity focus-visible:opacity-100",
    placement,
    controlRevealClasses[reveal][direction],
    isRevealed && "[@media(hover:none)]:opacity-100",
    (isRevealed || appearance === "gradient") && "disabled:invisible"
  )
}

function CarouselControl({
  direction,
  className,
  variant = "outline",
  size = "icon-sm",
  position = "outside",
  appearance = "button",
  reveal,
  arrow = false,
  ...props
}: React.ComponentProps<typeof Button> &
  CarouselControlProps & { direction: "prev" | "next" }) {
  const { orientation, scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
    useCarousel()
  const isPrev = direction === "prev"
  const Icon = isPrev ? ChevronLeftIcon : ChevronRightIcon
  const label = isPrev ? "Previous slide" : "Next slide"
  const controlClassName = cn(
    carouselControlClasses({
      direction,
      orientation,
      position,
      appearance,
      // Gradients fade in only on the side the pointer is over.
      reveal: reveal ?? (appearance === "gradient" ? "side" : "always"),
    }),
    className
  )
  const sharedProps = {
    "data-slot": isPrev ? "carousel-previous" : "carousel-next",
    "data-appearance": appearance,
    disabled: isPrev ? !canScrollPrev : !canScrollNext,
    onClick: isPrev ? scrollPrev : scrollNext,
  }

  if (appearance === "gradient") {
    return (
      <button
        type="button"
        {...sharedProps}
        className={cn(
          "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-5",
          controlClassName
        )}
        {...props}
      >
        {arrow ? <Icon /> : null}
        <span className="sr-only">{label}</span>
      </button>
    )
  }

  return (
    <Button
      {...sharedProps}
      variant={variant}
      size={size}
      className={controlClassName}
      {...props}
    >
      <Icon />
      <span className="sr-only">{label}</span>
    </Button>
  )
}

function CarouselPrevious(
  props: React.ComponentProps<typeof Button> & CarouselControlProps
) {
  return <CarouselControl direction="prev" {...props} />
}

function CarouselNext(
  props: React.ComponentProps<typeof Button> & CarouselControlProps
) {
  return <CarouselControl direction="next" {...props} />
}

function CarouselDots({
  className,
  position = "bottom",
  ...props
}: React.ComponentProps<"div"> & { position?: "top" | "bottom" }) {
  const { selectedIndex, snapCount, scrollTo } = useCarousel()

  if (snapCount < 2) return null

  return (
    <div
      data-slot="carousel-dots"
      data-position={position}
      className={cn(
        "pointer-events-none absolute inset-x-0 z-10 flex justify-center",
        position === "top" ? "top-2" : "bottom-2",
        className
      )}
      {...props}
    >
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-background/70 px-2 py-1.5 backdrop-blur-sm">
        {Array.from({ length: snapCount }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === selectedIndex ? "true" : undefined}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-1.5 cursor-pointer rounded-full transition-all outline-none hover:bg-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/50",
              index === selectedIndex
                ? "w-4 bg-foreground"
                : "w-1.5 bg-foreground/30"
            )}
          />
        ))}
      </div>
    </div>
  )
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  useCarousel,
}
