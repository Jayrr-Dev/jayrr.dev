"use client"

import type { ReactNode } from "react"
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileTextIcon,
  ImageIcon,
  MusicIcon,
  VideoIcon,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import {
  TextDots,
  TextFade,
  TextPop,
  TextReveal,
  TextTypewriter,
  TextWiggle,
} from "@/components/ui/text-effect"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Item, ItemContent, ItemTitle } from "@/components/ui/item"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { Marker, MarkerContent } from "@/components/ui/marker"
import { Message, MessageContent } from "@/components/ui/message"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import {
  Questionnaire,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { RendersDemoCard } from "./rendersDemoCard"

function TypeCard({
  label,
  children,
  wide,
}: {
  label: string
  children: ReactNode
  wide?: boolean
}) {
  let className: string | undefined

  if (wide) {
    className = "w-full max-w-xl"
  }

  return (
    <RendersDemoCard className={className} label={label}>
      {children}
    </RendersDemoCard>
  )
}

const carouselDemoSlides = [
  { value: "1", label: "Plan" },
  { value: "2", label: "Build" },
  { value: "3", label: "Ship" },
]

function CarouselDemoSlides({ className }: { className?: string }) {
  return (
    <CarouselContent className={className}>
      {carouselDemoSlides.map((slide) => (
        <CarouselItem key={slide.value}>
          <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-lg border border-border bg-muted/40">
            <span className="text-2xl font-semibold tabular-nums">
              {slide.value}
            </span>
            <span className="text-xs text-muted-foreground">
              {slide.label}
            </span>
          </div>
        </CarouselItem>
      ))}
    </CarouselContent>
  )
}

const bubbleVariants = [
  "secondary",
  "muted",
  "tinted",
  "outline",
  "ghost",
  "speech",
  "destructive",
] as const

const buttonVariants = ["secondary", "ghost", "link"] as const
const buttonSizes = ["xs", "sm", "lg"] as const
const attachmentStates = ["idle", "uploading", "processing", "error"] as const
const markerVariants = ["separator", "border"] as const
const itemVariants = ["outline", "muted"] as const
const sheetSides = ["top", "left", "bottom"] as const
const drawerDirections = ["top", "left", "right"] as const
const popoverSides = ["top", "left", "right"] as const

export function RendersTypePropCards({
  pieceName,
}: {
  pieceName: string
}) {
  if (pieceName === "Button") {
    return (
      <>
        {buttonVariants.map((variant) => (
          <TypeCard key={variant} label={`variant ${variant}`}>
            <Button variant={variant}>Save</Button>
          </TypeCard>
        ))}
        {buttonSizes.map((size) => (
          <TypeCard key={size} label={`size ${size}`}>
            <Button size={size}>Save</Button>
          </TypeCard>
        ))}
        <TypeCard label="size icon">
          <Button size="icon" aria-label="Next">
            <ChevronRightIcon />
          </Button>
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Badge") {
    return (
      <>
        <TypeCard label="variant ghost">
          <Badge variant="ghost">Ghost</Badge>
        </TypeCard>
        <TypeCard label="variant link">
          <Badge variant="link">Link</Badge>
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Avatar") {
    return (
      <>
        <TypeCard label="size sm">
          <Avatar size="sm">
            <AvatarFallback>JR</AvatarFallback>
          </Avatar>
        </TypeCard>
        <TypeCard label="size lg">
          <Avatar size="lg">
            <AvatarFallback>JR</AvatarFallback>
          </Avatar>
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Toggle") {
    return (
      <>
        <TypeCard label="variant outline">
          <Toggle variant="outline" defaultPressed>
            Bold
          </Toggle>
        </TypeCard>
        <TypeCard label="size sm">
          <Toggle size="sm">Small</Toggle>
        </TypeCard>
        <TypeCard label="size lg">
          <Toggle size="lg">Large</Toggle>
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Checkbox") {
    return (
      <>
        <TypeCard label="unchecked">
          <div className="flex items-center gap-2">
            <Checkbox id="open" />
            <Label htmlFor="open">Open</Label>
          </div>
        </TypeCard>
        <TypeCard label="disabled">
          <div className="flex items-center gap-2">
            <Checkbox id="locked" disabled defaultChecked />
            <Label htmlFor="locked">Locked</Label>
          </div>
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Switch") {
    return (
      <>
        <TypeCard label="size sm">
          <Switch size="sm" defaultChecked aria-label="Small switch" />
        </TypeCard>
        <TypeCard label="unchecked">
          <Switch aria-label="Off switch" />
        </TypeCard>
        <TypeCard label="disabled">
          <Switch disabled defaultChecked aria-label="Disabled switch" />
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Progress") {
    return (
      <>
        <TypeCard label="value 0">
          <Progress value={0} className="w-full" />
        </TypeCard>
        <TypeCard label="value 100">
          <Progress value={100} className="w-full" />
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Kbd") {
    return (
      <TypeCard label="group">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </TypeCard>
    )
  }

  if (pieceName === "Marker") {
    return (
      <>
        {markerVariants.map((variant) => (
          <TypeCard key={variant} label={`variant ${variant}`}>
            <Marker variant={variant} className="w-full">
              <MarkerContent>{variant}</MarkerContent>
            </Marker>
          </TypeCard>
        ))}
      </>
    )
  }

  if (pieceName === "Aspect Ratio") {
    return (
      <>
        <TypeCard label="ratio 1">
          <div className="w-full">
            <AspectRatio ratio={1} className="rounded-lg bg-muted" />
          </div>
        </TypeCard>
        <TypeCard label="ratio 4 / 3">
          <div className="w-full">
            <AspectRatio ratio={4 / 3} className="rounded-lg bg-muted" />
          </div>
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Carousel") {
    return (
      <>
        <TypeCard label="position inside" wide>
          <Carousel className="w-full">
            <CarouselDemoSlides />
            <CarouselPrevious position="inside" />
            <CarouselNext position="inside" />
          </Carousel>
        </TypeCard>
        <TypeCard label="dots bottom" wide>
          <Carousel className="w-full">
            <CarouselDemoSlides />
            <CarouselPrevious position="inside" />
            <CarouselNext position="inside" />
            <CarouselDots position="bottom" />
          </Carousel>
        </TypeCard>
        <TypeCard label="dots top" wide>
          <Carousel className="w-full">
            <CarouselDemoSlides />
            <CarouselPrevious position="inside" />
            <CarouselNext position="inside" />
            <CarouselDots position="top" />
          </Carousel>
        </TypeCard>
        <TypeCard label="appearance gradient" wide>
          <Carousel className="w-full">
            <CarouselDemoSlides />
            <CarouselPrevious appearance="gradient" />
            <CarouselNext appearance="gradient" />
            <CarouselDots />
          </Carousel>
        </TypeCard>
        <TypeCard label="gradient + arrow" wide>
          <Carousel className="w-full">
            <CarouselDemoSlides />
            <CarouselPrevious appearance="gradient" arrow />
            <CarouselNext appearance="gradient" arrow />
            <CarouselDots />
          </Carousel>
        </TypeCard>
        <TypeCard label="reveal side" wide>
          <Carousel className="w-full">
            <CarouselDemoSlides />
            <CarouselPrevious position="inside" reveal="side" />
            <CarouselNext position="inside" reveal="side" />
          </Carousel>
        </TypeCard>
        <TypeCard label="orientation vertical" wide>
          <div className="w-full py-10">
            <Carousel orientation="vertical" className="w-full">
              <CarouselDemoSlides className="h-32" />
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Button Group") {
    return (
      <>
        <TypeCard label="orientation vertical">
          <ButtonGroup orientation="vertical">
            <Button variant="outline">Top</Button>
            <Button variant="outline">Bottom</Button>
          </ButtonGroup>
        </TypeCard>
        <TypeCard label="variant pill">
          <ButtonGroup variant="pill">
            <Button>Publish</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" aria-label="More publish options">
                  <ChevronDownIcon className="transition-transform group-aria-expanded/button:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Schedule</DropdownMenuItem>
                <DropdownMenuItem>Save draft</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
        </TypeCard>
        <TypeCard label="variant pill outline">
          <ButtonGroup variant="pill">
            <Button variant="outline">Export</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More export options">
                  <ChevronDownIcon className="transition-transform group-aria-expanded/button:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>PDF</DropdownMenuItem>
                <DropdownMenuItem>CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Input") {
    return (
      <>
        <TypeCard label="disabled">
          <Input disabled placeholder="Locked" className="w-full" />
        </TypeCard>
        <TypeCard label="type email">
          <Input type="email" placeholder="you@jayrr.dev" className="w-full" />
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Textarea") {
    return (
      <TypeCard label="disabled">
        <Textarea disabled placeholder="Locked" className="w-full" />
      </TypeCard>
    )
  }

  if (pieceName === "Input Group") {
    return (
      <TypeCard label="align inline-end" wide>
        <InputGroup>
          <InputGroupInput placeholder="Search" />
          <InputGroupAddon align="inline-end">Go</InputGroupAddon>
        </InputGroup>
      </TypeCard>
    )
  }

  if (pieceName === "Field") {
    return (
      <>
        <TypeCard label="orientation horizontal" wide>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="name-row">Name</FieldLabel>
            <Input id="name-row" placeholder="Jayrr" />
          </Field>
        </TypeCard>
        {(["left", "center", "right"] as const).map((edge) => (
          <TypeCard key={edge} label={`label edge ${edge}`}>
            <Field labelEdge={edge}>
              <FieldLabel htmlFor={`name-edge-${edge}`}>Name</FieldLabel>
              <Input id={`name-edge-${edge}`} placeholder="Jayrr" />
            </Field>
          </TypeCard>
        ))}
        <TypeCard label="label as placeholder">
          <Field>
            <FieldLabel htmlFor="name-placeholder" className="sr-only">
              Name
            </FieldLabel>
            <Input id="name-placeholder" placeholder="Name" />
          </Field>
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Slider") {
    return (
      <>
        <TypeCard label="default 40">
          <Slider defaultValue={[40]} className="w-full" />
        </TypeCard>
        <TypeCard label="orientation vertical">
          <Slider
            orientation="vertical"
            defaultValue={[60]}
            className="h-24"
          />
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Toggle Group") {
    return (
      <>
        <TypeCard label="type multiple">
          <ToggleGroup type="multiple" defaultValue={["left"]}>
            <ToggleGroupItem value="left">Left</ToggleGroupItem>
            <ToggleGroupItem value="right">Right</ToggleGroupItem>
          </ToggleGroup>
        </TypeCard>
        <TypeCard label="variant outline">
          <ToggleGroup type="single" variant="outline" defaultValue="one">
            <ToggleGroupItem value="one">One</ToggleGroupItem>
            <ToggleGroupItem value="two">Two</ToggleGroupItem>
          </ToggleGroup>
        </TypeCard>
        <TypeCard label="orientation vertical">
          <ToggleGroup type="single" orientation="vertical" defaultValue="one">
            <ToggleGroupItem value="one">One</ToggleGroupItem>
            <ToggleGroupItem value="two">Two</ToggleGroupItem>
          </ToggleGroup>
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Item") {
    return (
      <>
        {itemVariants.map((variant) => (
          <TypeCard key={variant} label={`variant ${variant}`}>
            <Item variant={variant} className="w-full">
              <ItemContent>
                <ItemTitle>{variant}</ItemTitle>
              </ItemContent>
            </Item>
          </TypeCard>
        ))}
        <TypeCard label="size xs">
          <Item size="xs" variant="outline" className="w-full">
            <ItemContent>
              <ItemTitle>Compact</ItemTitle>
            </ItemContent>
          </Item>
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Empty") {
    return (
      <TypeCard label="media icon" wide>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileTextIcon />
            </EmptyMedia>
            <EmptyTitle>No files</EmptyTitle>
            <EmptyDescription>Drop one here.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm">
              Upload file
            </Button>
          </EmptyContent>
        </Empty>
      </TypeCard>
    )
  }

  if (pieceName === "Alert") {
    return (
      <TypeCard label="variant destructive" wide>
        <Alert variant="destructive">
          <AlertTitle>Upload failed</AlertTitle>
          <AlertDescription>The file was too large.</AlertDescription>
        </Alert>
      </TypeCard>
    )
  }

  if (pieceName === "Sheet") {
    return (
      <>
        {sheetSides.map((side) => (
          <TypeCard key={side} label={`side ${side}`}>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">{side}</Button>
              </SheetTrigger>
              <SheetContent side={side}>
                <SheetHeader>
                  <SheetTitle>{side}</SheetTitle>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </TypeCard>
        ))}
      </>
    )
  }

  if (pieceName === "Drawer") {
    return (
      <>
        {drawerDirections.map((direction) => (
          <TypeCard key={direction} label={`direction ${direction}`}>
            <Drawer direction={direction}>
              <DrawerTrigger asChild>
                <Button variant="outline">{direction}</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>{direction}</DrawerTitle>
                </DrawerHeader>
              </DrawerContent>
            </Drawer>
          </TypeCard>
        ))}
      </>
    )
  }

  if (pieceName === "Popover") {
    return (
      <>
        {popoverSides.map((side) => (
          <TypeCard key={side} label={`side ${side}`}>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">{side}</Button>
              </PopoverTrigger>
              <PopoverContent side={side}>Opens on the {side}.</PopoverContent>
            </Popover>
          </TypeCard>
        ))}
        <TypeCard label="variant tooltip">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">tooltip</Button>
            </PopoverTrigger>
            <PopoverContent variant="tooltip">
              Points down at its trigger.
            </PopoverContent>
          </Popover>
        </TypeCard>
        <TypeCard label="variant arrow">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">arrow</Button>
            </PopoverTrigger>
            <PopoverContent variant="arrow" side="top" className="w-56">
              Surface popover with a caret.
            </PopoverContent>
          </Popover>
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Tooltip") {
    return (
      <>
        <TypeCard label="side top">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Top</Button>
            </TooltipTrigger>
            <TooltipContent side="top">Above</TooltipContent>
          </Tooltip>
        </TypeCard>
        <TypeCard label="side left">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Left</Button>
            </TooltipTrigger>
            <TooltipContent side="left">Beside</TooltipContent>
          </Tooltip>
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Tabs") {
    return (
      <>
        <TypeCard label="variant line">
          <Tabs defaultValue="one" className="w-full">
            <TabsList variant="line">
              <TabsTrigger value="one">One</TabsTrigger>
              <TabsTrigger value="two">Two</TabsTrigger>
            </TabsList>
          </Tabs>
        </TypeCard>
        <TypeCard label="variant primary">
          <Tabs defaultValue="photos" className="w-full">
            <TabsList variant="primary">
              <TabsTrigger value="photos">
                <ImageIcon />
                Photos
              </TabsTrigger>
              <TabsTrigger value="videos">
                <VideoIcon />
                Videos
              </TabsTrigger>
              <TabsTrigger value="audio">
                <MusicIcon />
                Audio
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </TypeCard>
        <TypeCard label="variant secondary">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList variant="secondary">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specs">Specs</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
          </Tabs>
        </TypeCard>
        <TypeCard label="orientation vertical">
          <Tabs defaultValue="one" orientation="vertical" className="w-full">
            <TabsList>
              <TabsTrigger value="one">One</TabsTrigger>
              <TabsTrigger value="two">Two</TabsTrigger>
            </TabsList>
          </Tabs>
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Text Effect") {
    return (
      <>
        <TypeCard label="typewriter">
          <TextTypewriter loop holdMs={4000} text="Typed one letter at a time." />
        </TypeCard>
        <TypeCard label="typewriter cycle">
          <TextTypewriter text={["Hello!", "Hi there", "What's up?"]} />
        </TypeCard>
        <TypeCard label="wiggle">
          <TextWiggle>Oink! Am I real?</TextWiggle>
        </TypeCard>
        <TypeCard label="dots">
          <TextDots>Thinking</TextDots>
        </TypeCard>
        <TypeCard label="pop">
          <TextPop>Saved!</TextPop>
        </TypeCard>
        <TypeCard label="fade">
          <TextFade>Words drift in, one by one.</TextFade>
        </TypeCard>
        <TypeCard label="reveal">
          <TextReveal text="Streamed text is paced to a steady read speed, no matter how it arrives." />
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Bubble") {
    return (
      <>
        {bubbleVariants.map((variant) => (
          <TypeCard key={variant} label={`variant ${variant}`}>
            <Bubble variant={variant}>
              <BubbleContent>Hello</BubbleContent>
            </Bubble>
          </TypeCard>
        ))}
        <TypeCard label="align end">
          <Bubble align="end">
            <BubbleContent>Hello</BubbleContent>
          </Bubble>
        </TypeCard>
        <TypeCard label="speech align end">
          <Bubble variant="speech" align="end">
            <BubbleContent>Hello</BubbleContent>
          </Bubble>
        </TypeCard>
        <TypeCard label="speech typewriter" wide>
          <Bubble variant="speech">
            <BubbleContent>
              <p className="font-medium">
                <TextTypewriter text="What's rattling in the bank?" />
              </p>
            </BubbleContent>
          </Bubble>
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Message") {
    return (
      <>
        <TypeCard label="align start" wide>
          <Message align="start">
            <MessageContent>Incoming note.</MessageContent>
          </Message>
        </TypeCard>
        <TypeCard label="align end" wide>
          <Message align="end">
            <MessageContent>Outgoing note.</MessageContent>
          </Message>
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Attachment") {
    return (
      <>
        {attachmentStates.map((state) => (
          <TypeCard key={state} label={`state ${state}`} wide>
            <Attachment state={state} className="w-full">
              <AttachmentMedia>
                <FileTextIcon />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>notes.txt</AttachmentTitle>
                <AttachmentDescription>{state}</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
          </TypeCard>
        ))}
        <TypeCard label="size sm" wide>
          <Attachment size="sm" className="w-full">
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>notes.txt</AttachmentTitle>
            </AttachmentContent>
          </Attachment>
        </TypeCard>
        <TypeCard label="orientation vertical">
          <Attachment orientation="vertical">
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>notes.txt</AttachmentTitle>
            </AttachmentContent>
          </Attachment>
        </TypeCard>
      </>
    )
  }

  if (pieceName === "Questionnaire") {
    return (
      <TypeCard label="multiple" wide>
        <Questionnaire
          items={[
            {
              name: "tools",
              choices: [{ value: "button" }, { value: "badge" }],
            },
          ]}
        >
          <QuestionnaireItem name="tools" multiple>
            <QuestionnaireTitle>Pick any</QuestionnaireTitle>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="button">Button</QuestionnaireChoice>
              <QuestionnaireChoice value="badge">Badge</QuestionnaireChoice>
            </QuestionnaireChoices>
          </QuestionnaireItem>
          <QuestionnaireNext />
        </Questionnaire>
      </TypeCard>
    )
  }

  if (pieceName === "Separator") {
    return (
      <TypeCard label="orientation vertical">
        <div className="flex h-16 items-center gap-3">
          <span className="text-sm">Left</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Right</span>
        </div>
      </TypeCard>
    )
  }

  return null
}
