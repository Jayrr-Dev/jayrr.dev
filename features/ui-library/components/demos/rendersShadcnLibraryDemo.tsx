"use client"

import { useState } from "react"
import { ChevronRightIcon, FileTextIcon, XIcon } from "lucide-react"
import { Bar, BarChart } from "recharts"
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
} from "@/components/ui/carousel"
import { ChartContainer } from "@/components/ui/chart"
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Item, ItemContent, ItemTitle } from "@/components/ui/item"
import { Kbd } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { Marker, MarkerContent } from "@/components/ui/marker"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
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
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Slider } from "@/components/ui/slider"
import { Toaster } from "@/components/ui/sonner"
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

const chartData = [
  { name: "Mon", visits: 4 },
  { name: "Tue", visits: 7 },
  { name: "Wed", visits: 5 },
]

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
        <MessageScroller className="h-56 w-full rounded-lg border">
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

function libraryDemo(pieceName: string) {
  if (pieceName === "Kbd") {
    return <Kbd>K</Kbd>
  }

  if (pieceName === "Spinner") {
    return <Spinner />
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
      <Carousel className="w-full">
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>
    )
  }

  if (pieceName === "Chart") {
    return (
      <ChartContainer
        config={{ visits: { label: "Visits", color: "var(--chart-1)" } }}
        className="h-32 w-full"
      >
        <BarChart data={chartData}>
          <Bar dataKey="visits" fill="var(--color-visits)" radius={4} />
        </BarChart>
      </ChartContainer>
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
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/gallery">Gallery</NavigationMenuLink>
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
            <PaginationLink href="/gallery" isActive>
              1
            </PaginationLink>
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
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    )
  }

  if (pieceName === "Sidebar") {
    return (
      <SidebarProvider className="min-h-40 w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Library</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>Home</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
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
      <Command className="w-full rounded-lg border">
        <CommandInput placeholder="Search pieces" />
        <CommandList>
          <CommandEmpty>No piece</CommandEmpty>
          <CommandGroup heading="Pieces">
            <CommandItem>Button</CommandItem>
            <CommandItem>Card</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
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

  if (pieceName === "Sonner") {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => {
            toast("Saved")
          }}
        >
          Show toast
        </Button>
        <Toaster />
      </>
    )
  }

  if (pieceName === "Empty") {
    return (
      <Empty className="w-full border">
        <EmptyHeader>
          <EmptyTitle>No pieces</EmptyTitle>
          <EmptyDescription>This shelf is empty.</EmptyDescription>
        </EmptyHeader>
      </Empty>
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
            <AlertDialogDescription>
              Nothing is deleted.
            </AlertDialogDescription>
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
        <ContextMenuTrigger className="flex h-16 w-full items-center justify-center rounded-lg border border-dashed text-sm">
          Right click
        </ContextMenuTrigger>
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
        <CollapsibleContent className="pt-2 text-sm">
          Hidden until you open it.
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
              <BubbleContent>The gallery is ready. Want the notes too?</BubbleContent>
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
          <QuestionnaireDescription>A short name is enough.</QuestionnaireDescription>
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
      <ResizablePanelGroup className="h-24 w-full rounded-lg border">
        <ResizablePanel defaultSize={50}>Left</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>Right</ResizablePanel>
      </ResizablePanelGroup>
    )
  }

  if (pieceName === "Scroll Area") {
    return (
      <ScrollArea className="h-24 w-full rounded-lg border p-2">
        <p className="text-sm">Line one</p>
        <p className="text-sm">Line two</p>
        <p className="text-sm">Line three</p>
        <p className="text-sm">Line four</p>
        <p className="text-sm">Line five</p>
      </ScrollArea>
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

export function RendersShadcnLibraryDemo({
  pieceName,
}: {
  pieceName: string
}) {
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

  return <RendersDemoCard className={cardClassName}>{demo}</RendersDemoCard>
}
