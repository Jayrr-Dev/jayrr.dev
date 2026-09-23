export type GalleryCard = {
  name: string
  installed?: boolean
}

export type GalleryCategory = {
  name: string
  cards: GalleryCard[]
}

export type GallerySection = {
  name: string
  categories: GalleryCategory[]
}

export type GalleryStyle = {
  name: string
  sections: GallerySection[]
}

import { buildsStandardSections } from "@/features/standard-library/domain/catalog/definesStandardCatalog"

export const standardSections: GallerySection[] = buildsStandardSections()

function library(name: string): GalleryCard {
  return { name, installed: true }
}

export const gallerySections: GallerySection[] = [
  {
    name: "Content",
    categories: [
      {
        name: "Text",
        cards: [
          { name: "Heading" },
          { name: "Paragraph" },
          { name: "Caption" },
          { name: "Code" },
          library("Kbd"),
        ],
      },
      {
        name: "Icon",
        cards: [
          { name: "Symbol" },
          { name: "Status" },
          library("Spinner"),
          library("Marker"),
        ],
      },
      {
        name: "Media",
        cards: [
          { name: "Image" },
          library("Avatar"),
          library("Aspect Ratio"),
          library("Carousel"),
          library("Chart"),
        ],
      },
    ],
  },
  {
    name: "Interaction",
    categories: [
      {
        name: "Action",
        cards: [library("Button"), library("Button Group")],
      },
      {
        name: "Navigation",
        cards: [
          { name: "Link" },
          library("Breadcrumb"),
          library("Navigation Menu"),
          library("Pagination"),
          library("Menubar"),
          library("Sidebar"),
        ],
      },
      {
        name: "Input",
        cards: [
          { name: "Text field" },
          { name: "Search" },
          library("Input"),
          library("Textarea"),
          library("Input OTP"),
          library("Input Group"),
          library("Select"),
          library("Native Select"),
          library("Combobox"),
          library("Command"),
          library("Field"),
          library("Slider"),
          library("Calendar"),
        ],
      },
      {
        name: "Selection",
        cards: [
          library("Checkbox"),
          library("Radio"),
          library("Radio Group"),
          library("Toggle"),
          library("Toggle Group"),
          library("Switch"),
        ],
      },
    ],
  },
  {
    name: "Meaning",
    categories: [
      {
        name: "Label",
        cards: [
          { name: "Field label" },
          library("Label"),
          library("Badge"),
          library("Item"),
        ],
      },
      {
        name: "Indicator",
        cards: [
          library("Progress"),
          library("Skeleton"),
          library("Sonner"),
          library("Empty"),
        ],
      },
    ],
  },
  {
    name: "Structure",
    categories: [
      {
        name: "Surface",
        cards: [
          library("Card"),
          library("Dialog"),
          library("Alert"),
          library("Alert Dialog"),
          library("Sheet"),
          library("Drawer"),
          library("Popover"),
          library("Hover Card"),
          library("Tooltip"),
          library("Dropdown Menu"),
          library("Context Menu"),
          library("Accordion"),
          library("Collapsible"),
          library("Tabs"),
          library("Table"),
          library("Bubble"),
          library("Message"),
          library("Attachment"),
          library("Questionnaire"),
        ],
      },
      {
        name: "Separator",
        cards: [{ name: "Divider" }, library("Separator")],
      },
      {
        name: "Layout",
        cards: [
          { name: "Stack" },
          { name: "Row" },
          library("Resizable"),
          library("Scroll Area"),
          library("Direction"),
          library("Message Scroller"),
        ],
      },
    ],
  },
]

export const galleryStyles: GalleryStyle[] = [
  {
    name: "Classic",
    sections: gallerySections,
  },
  {
    name: "Standard",
    sections: standardSections,
  },
]

export function toPieceSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-")
}

export function findStyle(styleName: string) {
  return galleryStyles.find(
    (entry) => entry.name.toLowerCase() === styleName.toLowerCase()
  )
}

export function findPiece(styleName: string, pieceSlug: string) {
  const style = findStyle(styleName)
  if (!style) {
    return null
  }

  for (const section of style.sections) {
    for (const category of section.categories) {
      for (const card of category.cards) {
        if (toPieceSlug(card.name) === pieceSlug) {
          return { style, section, category, card }
        }
      }
    }
  }

  return null
}
