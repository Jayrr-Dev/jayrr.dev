import seed from "@/features/standard-library/domain/catalog/uiLibraryCatalogSeed.json"

const SECTION_ORDER = [
  { id: "controls", label: "Controls" },
  { id: "content", label: "Content" },
  { id: "overlays", label: "Overlays" },
  { id: "signals", label: "Signals" },
] as const

const CATEGORY_ORDER: Record<string, { id: string; label: string }[]> = {
  controls: [
    { id: "buttons", label: "Buttons" },
    { id: "fields", label: "Fields" },
    { id: "pickers", label: "Pickers" },
    { id: "toggles", label: "Toggles" },
    { id: "scroll", label: "Scroll" },
    { id: "badges", label: "Badges" },
    { id: "icons", label: "Icons" },
  ],
  content: [
    { id: "tables", label: "Tables" },
    { id: "cards", label: "Cards" },
    { id: "charts", label: "Charts" },
    { id: "badges", label: "Badges" },
    { id: "text", label: "Text" },
    { id: "layout", label: "Layout" },
  ],
  overlays: [
    { id: "dialogs", label: "Dialogs" },
    { id: "sheets", label: "Sheets" },
    { id: "popovers", label: "Popovers" },
    { id: "menus", label: "Menus" },
  ],
  signals: [
    { id: "loading", label: "Loading" },
    { id: "alerts", label: "Alerts" },
    { id: "notifications", label: "Notifications" },
    { id: "nav", label: "Nav" },
  ],
}

export type StandardCatalogEntry = {
  component_key: string
  component_name: string
  section_key: string
  category_key: string
}

export const standardCatalogEntries = seed as StandardCatalogEntry[]

export function findStandardCatalogEntry(pieceName: string) {
  return standardCatalogEntries.find(
    (entry) => entry.component_name === pieceName
  )
}

export function buildsStandardSections() {
  return SECTION_ORDER.map((section) => {
    const categories = (CATEGORY_ORDER[section.id] ?? []).map((category) => {
      const cards = standardCatalogEntries
        .filter(
          (entry) =>
            entry.section_key === section.id &&
            entry.category_key === category.id
        )
        .map((entry) => ({ name: entry.component_name }))

      return {
        name: category.label,
        cards,
      }
    })

    return {
      name: section.label,
      categories: categories.filter((category) => category.cards.length > 0),
    }
  })
}
