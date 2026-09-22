import type { GalleryIconName } from "@/components/gallery-icon"

export type GalleryCard = {
  name: GalleryIconName
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
  library?: string
  sections: GallerySection[]
}

function copySections(sections: GallerySection[]): GallerySection[] {
  return sections.map((section) => ({
    name: section.name,
    categories: section.categories.map((category) => ({
      name: category.name,
      cards: category.cards.map((card) => ({ name: card.name })),
    })),
  }))
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
        ],
      },
      {
        name: "Icon",
        cards: [{ name: "Symbol" }, { name: "Status" }],
      },
      {
        name: "Media",
        cards: [{ name: "Image" }, { name: "Avatar" }],
      },
    ],
  },
  {
    name: "Interaction",
    categories: [
      {
        name: "Action",
        cards: [{ name: "Button", installed: true }],
      },
      {
        name: "Navigation",
        cards: [{ name: "Link" }],
      },
      {
        name: "Input",
        cards: [{ name: "Text field" }, { name: "Search" }],
      },
      {
        name: "Selection",
        cards: [{ name: "Checkbox" }, { name: "Radio" }, { name: "Toggle" }],
      },
    ],
  },
  {
    name: "Meaning",
    categories: [
      {
        name: "Label",
        cards: [{ name: "Field label" }],
      },
      {
        name: "Indicator",
        cards: [{ name: "Badge" }, { name: "Progress" }, { name: "Skeleton" }],
      },
    ],
  },
  {
    name: "Structure",
    categories: [
      {
        name: "Surface",
        cards: [{ name: "Card" }, { name: "Dialog" }],
      },
      {
        name: "Separator",
        cards: [{ name: "Divider" }],
      },
      {
        name: "Layout",
        cards: [{ name: "Stack" }, { name: "Row" }],
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
    sections: copySections(gallerySections),
  },
]
