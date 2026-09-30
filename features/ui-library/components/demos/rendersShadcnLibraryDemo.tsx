"use client"

import Link from "next/link"
import { useState } from "react"
import {
  BookOpenIcon,
  ChevronRightIcon,
  FileTextIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  LayersIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Calendar } from "@/components/ui/calendar"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { DirectionProvider, useDirection } from "@/components/ui/direction"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Item, ItemContent, ItemTitle } from "@/components/ui/item"
import { Kbd } from "@/components/ui/kbd"
import { TextTypewriter } from "@/components/ui/text-effect"
import { NumberCountUp } from "@/components/ui/number-effect"
import { Label } from "@/components/ui/label"
import { Marker, MarkerContent } from "@/components/ui/marker"
import {
  Menubar,
  MenubarContent,
  MenubarCheckboxItem,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { RendersDemoCard } from "./rendersDemoCard"

const threadNotes = [
  "Opened the gallery.",
  "Picked Classic.",
  "Checked the icons.",
  "Opened the thread.",
  "Scrolled up a bit.",
  "Latest note sits at the bottom.",
]

function DirectionLane({ dir }: { dir: "ltr" | "rtl" }) {
  return (
    <DirectionProvider dir={dir}>
      <DirectionLaneBody />
    </DirectionProvider>
  )
}

function DirectionLaneBody() {
  const dir = useDirection()

  return (
    <div
      dir={dir}
      className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm"
    >
      <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs uppercase">
        {dir}
      </span>
      <span className="ms-auto flex items-center gap-1 text-muted-foreground">
        Gallery
        <ChevronRightIcon className="size-3.5 rtl:rotate-180" />
        Classic
      </span>
    </div>
  )
}

function MessageThreadDemo() {
  const [notes, setNotes] = useState(threadNotes)

  return (
    <div className="flex w-full flex-col gap-2">
      <MessageScrollerProvider autoScroll defaultScrollPosition="end">
        <div className="h-56 w-full overflow-hidden rounded-lg border">
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent className="gap-2 p-3">
                {notes.map((note, index) => (
                  <MessageScrollerItem key={`${note}-${index}`}>
                    <Bubble
                      align={index % 2 === 0 ? "start" : "end"}
                      variant={index % 2 === 0 ? "muted" : "default"}
                    >
                      <BubbleContent>{note}</BubbleContent>
                    </Bubble>
                  </MessageScrollerItem>
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </div>
      </MessageScrollerProvider>
      <Button
        className="self-end"
        size="sm"
        variant="outline"
        onClick={() => {
          setNotes((current) => [...current, `Note ${current.length + 1}`])
        }}
      >
        Add note
      </Button>
    </div>
  )
}

const sidebarAccordionSections = [
  {
    id: "projects",
    label: "Projects",
    icon: FolderIcon,
    items: ["Gallery", "Registry"],
  },
  { id: "docs", label: "Docs", icon: BookOpenIcon, items: ["Guides", "API"] },
]

// Only one section stays open at a time, like an accordion.
function SidebarAccordion() {
  const [openId, setOpenId] = useState<string | null>("projects")

  return (
    <>
      {sidebarAccordionSections.map(({ id, label, icon: Icon, items }) => (
        <Collapsible
          key={id}
          asChild
          open={openId === id}
          onOpenChange={(open) => setOpenId(open ? id : null)}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={label}>
                <Icon />
                <span>{label}</span>
                <ChevronRightIcon className="ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {items.map((item, index) => (
                  <SidebarMenuSubItem key={item}>
                    <SidebarMenuSubButton
                      isActive={id === "projects" && index === 0}
                    >
                      <span>{item}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      ))}
    </>
  )
}

function libraryDemo(pieceName: string) {
  if (pieceName === "Kbd") {
    return <Kbd>K</Kbd>
  }

  if (pieceName === "Text Effect") {
    return (
      <p className="text-lg font-medium">
        <TextTypewriter
          wiggle
          text={["Hello!", "What's rattling in the bank?", "Need a hand?"]}
        />
      </p>
    )
  }

  if (pieceName === "Number Effect") {
    return (
      <p className="text-4xl font-semibold">
        <NumberCountUp to={12480} startOnView={false} />
      </p>
    )
  }

  if (pieceName === "Spinner") {
    return (
      <div className="grid w-full grid-cols-4 gap-3">
        {(
          [
            "ring",
            "orbit",
            "dots",
            "bars",
            "pulse",
            "burst",
            "grid",
            "triangle",
          ] as const
        ).map((variant) => (
          <div key={variant} className="flex flex-col items-center gap-2">
            <Spinner variant={variant} className="size-6" />
            <span className="text-xs text-muted-foreground capitalize">
              {variant}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (pieceName === "Marker") {
    return (
      <Marker>
        <MarkerContent>New</MarkerContent>
      </Marker>
    )
  }

  if (pieceName === "Aspect Ratio") {
    return (
      <div className="w-full">
        <AspectRatio ratio={16 / 9} className="rounded-lg bg-muted" />
      </div>
    )
  }

  if (pieceName === "Carousel") {
    return (
      <div className="w-full px-10">
        <Carousel className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="flex h-24 flex-col items-center justify-center gap-1 rounded-lg border border-border bg-muted/40">
                <span className="text-2xl font-semibold tabular-nums">1</span>
                <span className="text-xs text-muted-foreground">Plan</span>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="flex h-24 flex-col items-center justify-center gap-1 rounded-lg border border-border bg-muted/40">
                <span className="text-2xl font-semibold tabular-nums">2</span>
                <span className="text-xs text-muted-foreground">Build</span>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="flex h-24 flex-col items-center justify-center gap-1 rounded-lg border border-border bg-muted/40">
                <span className="text-2xl font-semibold tabular-nums">3</span>
                <span className="text-xs text-muted-foreground">Ship</span>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    )
  }

  if (pieceName === "Button Group") {
    return (
      <ButtonGroup>
        <Button variant="outline">Cut</Button>
        <Button variant="outline">Copy</Button>
      </ButtonGroup>
    )
  }

  if (pieceName === "Breadcrumb") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/gallery">Gallery</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  if (pieceName === "Navigation Menu") {
    return (
      <NavigationMenu>
        <NavigationMenuList className="gap-1">
          <NavigationMenuItem>
            <NavigationMenuTrigger>Components</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-64 gap-1">
                <li>
                  <NavigationMenuLink href="/gallery">
                    <LayersIcon />
                    <div className="flex flex-col">
                      <span className="font-medium">Gallery</span>
                      <span className="text-xs text-muted-foreground">
                        Browse every piece.
                      </span>
                    </div>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink href="/gallery">
                    <BookOpenIcon />
                    <div className="flex flex-col">
                      <span className="font-medium">Docs</span>
                      <span className="text-xs text-muted-foreground">
                        Props and usage notes.
                      </span>
                    </div>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild data-active>
              <Link href="/gallery" className={navigationMenuTriggerStyle()}>
                Registry
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/gallery" className={navigationMenuTriggerStyle()}>
                About
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    )
  }

  if (pieceName === "Pagination") {
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  if (pieceName === "Menubar") {
    return (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New file <MenubarShortcut>Ctrl N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Open <MenubarShortcut>Ctrl O</MenubarShortcut>
            </MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>Export</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>PDF</MenubarItem>
                <MenubarItem>Markdown</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem>
              Print <MenubarShortcut>Ctrl P</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              Undo <MenubarShortcut>Ctrl Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Redo <MenubarShortcut>Ctrl Y</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked>Show toolbar</MenubarCheckboxItem>
            <MenubarCheckboxItem>Show line numbers</MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )
  }

  if (pieceName === "Sidebar") {
    return (
      <div className="relative h-120 w-full overflow-hidden rounded-xl border bg-sidebar">
        <SidebarProvider
          className="h-full min-h-0"
          style={{ "--sidebar-width-icon": "2.5rem" } as React.CSSProperties}
        >
          <Sidebar
            collapsible="icon"
            variant="inset"
            collapseThumb
            className="absolute h-full"
          >
            <SidebarHeader
              separator
              search
              className="group-data-[collapsible=icon]:px-1"
            >
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="jayrr.dev">
                    <LayersIcon />
                    <span className="font-semibold">jayrr.dev</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup
                collapsible
                className="group-data-[collapsible=icon]:px-1"
              >
                <SidebarGroupLabel>Library</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="group-data-[collapsible=icon]:gap-2">
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive tooltip="Home">
                        <HomeIcon />
                        <span>Home</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Inbox">
                        <InboxIcon />
                        <span>Inbox</span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge>12</SidebarMenuBadge>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarGroup
                collapsible
                separator
                className="group-data-[collapsible=icon]:px-1"
              >
                <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="group-data-[collapsible=icon]:gap-2">
                    <SidebarAccordion />
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter
              separator
              className="group-data-[collapsible=icon]:px-1"
            >
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Settings">
                    <SettingsIcon />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <SidebarInset className="min-w-0 overflow-hidden md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-0">
            <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>Projects</BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Gallery</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex flex-col gap-3 p-4">
              <div className="grid grid-cols-3 gap-2">
                {["Pieces", "Styles", "Icons"].map((label, index) => (
                  <div key={label} className="rounded-lg border p-2.5">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-lg font-semibold">
                      {[64, 3, 120][index]}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-2.5 w-2/3 rounded bg-muted" />
                <div className="h-2.5 w-full rounded bg-muted" />
                <div className="h-2.5 w-5/6 rounded bg-muted" />
              </div>
              <p className="text-xs text-muted-foreground">
                Use the toggle, the edge button, or Ctrl+B to collapse it.
              </p>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    )
  }

  if (pieceName === "Input") {
    return <Input placeholder="Email" />
  }

  if (pieceName === "Textarea") {
    return <Textarea placeholder="Notes" />
  }

  if (pieceName === "Input OTP") {
    return (
      <InputOTP maxLength={4}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
    )
  }

  if (pieceName === "Input Group") {
    return (
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput placeholder="jayrr.dev" />
      </InputGroup>
    )
  }

  if (pieceName === "Select") {
    return (
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Style" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="classic">Classic</SelectItem>
          <SelectItem value="standard">Standard</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  if (pieceName === "Native Select") {
    return (
      <NativeSelect>
        <NativeSelectOption value="classic">Classic</NativeSelectOption>
        <NativeSelectOption value="standard">Standard</NativeSelectOption>
      </NativeSelect>
    )
  }

  if (pieceName === "Combobox") {
    return (
      <Combobox>
        <ComboboxInput placeholder="Search styles" />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="classic">Classic</ComboboxItem>
            <ComboboxItem value="standard">Standard</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )
  }

  if (pieceName === "Command") {
    return (
      <div className="w-full rounded-xl border">
        <Command>
          <CommandInput placeholder="Search pieces" />
          <CommandList>
            <CommandEmpty>No piece</CommandEmpty>
            <CommandGroup heading="Pieces">
              <CommandItem>Button</CommandItem>
              <CommandItem>Card</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    )
  }

  if (pieceName === "Field") {
    return (
      <Field className="w-full">
        <FieldLabel htmlFor="library-name">Name</FieldLabel>
        <Input id="library-name" placeholder="Jayrr" />
      </Field>
    )
  }

  if (pieceName === "Slider") {
    return <Slider defaultValue={[40]} className="w-full" />
  }

  if (pieceName === "Calendar") {
    return <Calendar className="w-full" />
  }

  if (pieceName === "Radio Group") {
    return (
      <RadioGroup defaultValue="classic">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="classic" id="library-classic" />
          <Label htmlFor="library-classic">Classic</Label>
        </div>
      </RadioGroup>
    )
  }

  if (pieceName === "Toggle Group") {
    return (
      <ToggleGroup type="single" defaultValue="left">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    )
  }

  if (pieceName === "Switch") {
    return <Switch defaultChecked aria-label="Enabled" />
  }

  if (pieceName === "Label") {
    return <Label>Display name</Label>
  }

  if (pieceName === "Item") {
    return (
      <Item className="w-full">
        <ItemContent>
          <ItemTitle>Button</ItemTitle>
        </ItemContent>
      </Item>
    )
  }

  if (pieceName === "Toast") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => toast("Saved", { position: "top-left" })}
        >
          Top left
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.success("Changes published", {
              description: "Your site is live.",
              position: "top-center",
            })
          }
        >
          Top center · success
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.info("New version available", { position: "top-right" })
          }
        >
          Top right · info
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.warning("Storage almost full", { position: "bottom-left" })
          }
        >
          Bottom left · warning
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.error("Upload failed", {
              description: "Try again in a moment.",
              position: "bottom-center",
            })
          }
        >
          Bottom center · error
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("File deleted", {
              position: "bottom-right",
              action: {
                label: "Undo",
                onClick: () => toast.success("Restored"),
              },
            })
          }
        >
          Bottom right · action
        </Button>
      </div>
    )
  }

  if (pieceName === "Empty") {
    return (
      <div className="w-full rounded-xl border border-dashed">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No pieces</EmptyTitle>
            <EmptyDescription>This shelf is empty.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm">
              Add piece
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  if (pieceName === "Alert") {
    return (
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>This stays on the page.</AlertDescription>
      </Alert>
    )
  }

  if (pieceName === "Alert Dialog") {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Open alert</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave this piece?</AlertDialogTitle>
            <AlertDialogDescription>Nothing is deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  if (pieceName === "Sheet") {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Library</SheetTitle>
            <SheetDescription>Slides in from the side.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )
  }

  if (pieceName === "Drawer") {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Open drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Library</DrawerTitle>
            <DrawerDescription>Slides up from the bottom.</DrawerDescription>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    )
  }

  if (pieceName === "Popover") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent>Sits next to the button.</PopoverContent>
      </Popover>
    )
  }

  if (pieceName === "Hover Card") {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link">Hover</Button>
        </HoverCardTrigger>
        <HoverCardContent>More about this piece.</HoverCardContent>
      </HoverCard>
    )
  }

  if (pieceName === "Tooltip") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover</Button>
        </TooltipTrigger>
        <TooltipContent>Tooltip</TooltipContent>
      </Tooltip>
    )
  }

  if (pieceName === "Dropdown Menu") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Classic</DropdownMenuItem>
          <DropdownMenuItem>Standard</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (pieceName === "Context Menu") {
    return (
      <ContextMenu>
        <div className="w-full rounded-lg border border-dashed text-sm">
          <ContextMenuTrigger className="flex h-16 w-full items-center justify-center">
            Right click
          </ContextMenuTrigger>
        </div>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  if (pieceName === "Accordion") {
    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="one">
          <AccordionTrigger>Details</AccordionTrigger>
          <AccordionContent>The piece opens in place.</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  if (pieceName === "Collapsible") {
    return (
      <Collapsible className="w-full">
        <CollapsibleTrigger asChild>
          <Button variant="outline">Show more</Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <p className="text-sm">Hidden until you open it.</p>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  if (pieceName === "Tabs") {
    return (
      <Tabs defaultValue="one" className="w-full">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First panel</TabsContent>
        <TabsContent value="two">Second panel</TabsContent>
      </Tabs>
    )
  }

  if (pieceName === "Table") {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Piece</TableHead>
            <TableHead>Style</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Button</TableCell>
            <TableCell>Classic</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
  }

  if (pieceName === "Bubble") {
    return (
      <Bubble>
        <BubbleContent>Hello</BubbleContent>
      </Bubble>
    )
  }

  if (pieceName === "Message") {
    return (
      <MessageGroup className="w-full">
        <Message>
          <MessageAvatar>
            <Avatar size="sm">
              <AvatarFallback>JR</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>Jayrr</MessageHeader>
            <Bubble variant="muted">
              <BubbleContent>
                The gallery is ready. Want the notes too?
              </BubbleContent>
            </Bubble>
            <MessageFooter>2:14 PM</MessageFooter>
          </MessageContent>
        </Message>
        <Message align="end">
          <MessageAvatar>
            <Avatar size="sm">
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>Alex</MessageHeader>
            <Bubble>
              <BubbleContent>Yes, attach the file.</BubbleContent>
            </Bubble>
            <MessageFooter>2:15 PM</MessageFooter>
          </MessageContent>
        </Message>
      </MessageGroup>
    )
  }

  if (pieceName === "Attachment") {
    return (
      <div className="flex w-full flex-col gap-2">
        <Attachment className="w-full">
          <AttachmentMedia>
            <FileTextIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>notes.txt</AttachmentTitle>
            <AttachmentDescription>12 KB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="Remove notes">
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
        <Attachment className="w-full" state="uploading">
          <AttachmentMedia>
            <Spinner />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>photo.png</AttachmentTitle>
            <AttachmentDescription>Uploading</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
        <Attachment className="w-full" state="error">
          <AttachmentMedia>
            <FileTextIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>draft.pdf</AttachmentTitle>
            <AttachmentDescription>Could not upload</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      </div>
    )
  }

  if (pieceName === "Questionnaire") {
    return (
      <Questionnaire
        className="w-full"
        shortcuts="letters"
        items={[
          {
            name: "style",
            choices: [{ value: "classic" }, { value: "standard" }],
          },
          { name: "name" },
        ]}
      >
        <QuestionnaireProgress />
        <QuestionnaireItem name="style">
          <QuestionnaireTitle>Which style?</QuestionnaireTitle>
          <QuestionnaireDescription>
            Pick the library you want to browse.
          </QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="classic">
              Classic
              <QuestionnaireChoiceDescription>
                The first pass.
              </QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
            <QuestionnaireChoice value="standard">
              Standard
              <QuestionnaireChoiceDescription>
                A second pass.
              </QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
        <QuestionnaireItem name="name">
          <QuestionnaireTitle>What should we call it?</QuestionnaireTitle>
          <QuestionnaireDescription>
            A short name is enough.
          </QuestionnaireDescription>
          <QuestionnaireInput placeholder="Jayrr" />
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireNext />
          <QuestionnaireSubmit />
        </QuestionnaireActions>
      </Questionnaire>
    )
  }

  if (pieceName === "Separator") {
    return <Separator />
  }

  if (pieceName === "Resizable") {
    return (
      <div className="h-48 w-full overflow-hidden rounded-lg border">
        <ResizablePanelGroup>
          <ResizablePanel defaultSize="30%" minSize="20%">
            <div className="flex h-full flex-col gap-1.5 p-2 text-xs">
              <span className="px-1.5 pb-1 font-medium tracking-wide text-muted-foreground uppercase">
                Collections
              </span>
              {["Components", "Hooks", "Templates", "Icons"].map((name, i) => (
                <div
                  key={name}
                  className={
                    i === 0
                      ? "rounded-md bg-accent px-2 py-1.5 font-medium text-accent-foreground"
                      : "rounded-md px-2 py-1.5 text-muted-foreground"
                  }
                >
                  {name}
                </div>
              ))}
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="70%" minSize="30%">
            <ResizablePanelGroup orientation="vertical">
              <ResizablePanel defaultSize="60%" minSize="25%">
                <div className="flex h-full flex-col justify-center gap-1 p-3">
                  <span className="text-sm font-medium">Components</span>
                  <span className="text-xs text-muted-foreground">
                    Drag the handles to resize panes.
                  </span>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize="40%" minSize="20%">
                <div className="flex h-full items-center p-3 font-mono text-xs text-muted-foreground">
                  {"> preview ready"}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    )
  }

  if (pieceName === "Scroll Area") {
    return (
      <div className="w-full overflow-hidden rounded-lg border">
        <ScrollArea className="h-24 w-full p-2">
          <p className="text-sm">Line one</p>
          <p className="text-sm">Line two</p>
          <p className="text-sm">Line three</p>
          <p className="text-sm">Line four</p>
          <p className="text-sm">Line five</p>
        </ScrollArea>
      </div>
    )
  }

  if (pieceName === "Direction") {
    return (
      <div className="flex w-full min-w-80 flex-col gap-2">
        <DirectionLane dir="ltr" />
        <DirectionLane dir="rtl" />
      </div>
    )
  }

  if (pieceName === "Message Scroller") {
    return <MessageThreadDemo />
  }

  return null
}

// Layout demos that should use all the room a single-card dialog gives them.
const FILL_PIECES = new Set(["Sidebar", "Resizable", "Table"])

export function RendersShadcnLibraryDemo({ pieceName }: { pieceName: string }) {
  const demo = libraryDemo(pieceName)

  if (!demo) {
    return null
  }

  let cardClassName: string | undefined

  if (
    pieceName === "Message" ||
    pieceName === "Attachment" ||
    pieceName === "Questionnaire" ||
    pieceName === "Direction" ||
    pieceName === "Message Scroller"
  ) {
    cardClassName = "w-full max-w-xl"
  }

  return (
    <RendersDemoCard
      className={cardClassName}
      fill={FILL_PIECES.has(pieceName)}
    >
      {demo}
    </RendersDemoCard>
  )
}
