import componentPool from "@/features/ui-library/domain/catalog/galleryComponents.json"
import typeTree from "@/features/ui-library/domain/catalog/galleryTypes.json"

/**
 * A node in galleryTypes.json. Depth 0 is a style (Classic, Standard),
 * depth 1 a section (Content, Structure), depth 2 a category (Surface, Layout).
 */
export type GalleryTypeNode = {
  id: string
  label: string
  children?: GalleryTypeNode[]
}

/**
 * One entry in galleryComponents.json. `type` is the path of ids through the
 * type tree, e.g. "classic/structure/surface".
 */
export type GalleryComponent = {
  name: string
  type: string
  installed?: boolean
  key?: string
  family_key?: string | null
  file_path?: string | null
  import_path?: string | null
  preview_mode?: string | null
  needs_mock_data?: boolean
  mock_data_key?: string | null
  description?: string | null
}

export type GalleryCard = GalleryComponent

export type GalleryCategory = {
  id: string
  name: string
  cards: GalleryCard[]
}

export type GallerySection = {
  id: string
  name: string
  categories: GalleryCategory[]
}

export type GalleryStyle = {
  id: string
  name: string
  sections: GallerySection[]
}

export const galleryTypes = typeTree as GalleryTypeNode[]
export const galleryComponents = componentPool as GalleryComponent[]

/** Components grouped by type path, keeping pool order. */
function groupsComponentsByType() {
  const byType = new Map<string, GalleryComponent[]>()
  for (const component of galleryComponents) {
    const list = byType.get(component.type) ?? []
    list.push(component)
    byType.set(component.type, list)
  }
  return byType
}

/** Walks the type tree and fills each category with its components. Empty branches are dropped. */
function buildsGalleryStyles(): GalleryStyle[] {
  const byType = groupsComponentsByType()

  if (process.env.NODE_ENV !== "production") {
    const known = new Set(
      galleryTypes.flatMap((style) =>
        (style.children ?? []).flatMap((section) =>
          (section.children ?? []).map(
            (category) => `${style.id}/${section.id}/${category.id}`
          )
        )
      )
    )
    for (const [type, components] of byType) {
      if (!known.has(type)) {
        console.warn(
          `galleryComponents.json: unknown type "${type}" on ${components.map((c) => c.name).join(", ")}`
        )
      }
    }
  }

  return galleryTypes.map((style) => ({
    id: style.id,
    name: style.label,
    sections: (style.children ?? [])
      .map((section) => ({
        id: section.id,
        name: section.label,
        categories: (section.children ?? [])
          .map((category) => ({
            id: category.id,
            name: category.label,
            cards: byType.get(`${style.id}/${section.id}/${category.id}`) ?? [],
          }))
          .filter((category) => category.cards.length > 0),
      }))
      .filter((section) => section.categories.length > 0),
  }))
}

export const galleryStyles: GalleryStyle[] = buildsGalleryStyles()

export const gallerySections: GallerySection[] =
  galleryStyles.find((style) => style.id === "classic")?.sections ?? []

export function toPieceSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-")
}

export function findStyle(styleName: string) {
  const needle = styleName.toLowerCase()
  return galleryStyles.find(
    (entry) => entry.id === needle || entry.name.toLowerCase() === needle
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

/** Finds a component by style id and display name. */
export function findComponent(styleId: string, name: string) {
  return galleryComponents.find(
    (component) =>
      component.name === name && component.type.startsWith(`${styleId}/`)
  )
}
