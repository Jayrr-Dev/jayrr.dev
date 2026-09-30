import componentPool from "@/features/ui-library/domain/catalog/galleryComponents.json"
import typeTree from "@/features/ui-library/domain/catalog/galleryTypes.json"

/**
 * A node in galleryTypes.json. Depth 0 is a bucket (Content, Structure),
 * depth 1 a category (Surface, Layout).
 *
 * A bucket with `groupBy: "canonical"` or `groupBy: "tier"` sorts the whole
 * pool by that field on each component instead of its `type`, so every
 * component shows up there as well as in its functional bucket.
 */
export type GalleryTypeNode = {
  id: string
  label: string
  groupBy?: GalleryGroupBy
  children?: GalleryTypeNode[]
}

export type GalleryGroupBy = "type" | "canonical" | "tier"

/**
 * How assembled a piece is. Primitives are single building blocks (Button,
 * Input, Badge). Components combine primitives into one interactive unit
 * (Filter Select, Action Wheel). Blocks are full sections (App Bar, Wizard).
 */
export type GalleryTier = "primitive" | "component" | "block"

/** Which demo sets a piece shows in its Collections view. */
export type GalleryDemoSet = "classic" | "standard"

/**
 * One entry in galleryComponents.json. `type` is the path of ids through the
 * type tree, e.g. "structure/surface". `canonical` is a category id in the
 * Canonical bucket, e.g. "calendar". `tier` is a category id in the Tier
 * bucket.
 */
export type GalleryComponent = {
  name: string
  type: string
  canonical: string
  tier: GalleryTier
  demos: GalleryDemoSet[]
  standard_demo?: string
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
  /**
   * Set on Tier categories only: the same cards split by use, one group per
   * Canonical category, in Canonical order.
   */
  groups?: GalleryCategory[]
}

export type GalleryBucket = {
  id: string
  name: string
  groupBy: GalleryGroupBy
  categories: GalleryCategory[]
}

export const galleryTypes = typeTree as GalleryTypeNode[]
export const galleryComponents = componentPool as GalleryComponent[]

/** Buckets that re-sort the whole pool by a component field. */
const regroupingBuckets = galleryTypes.flatMap((bucket) =>
  bucket.groupBy === "canonical" || bucket.groupBy === "tier"
    ? [{ id: bucket.id, field: bucket.groupBy }]
    : []
)

/** Every "bucket/category" path a component belongs to. */
function placesComponent(component: GalleryComponent) {
  return [
    component.type,
    ...regroupingBuckets.map(({ id, field }) => `${id}/${component[field]}`),
  ]
}

/** Components grouped by path, keeping pool order. */
function groupsComponentsByPath() {
  const byPath = new Map<string, GalleryComponent[]>()
  for (const component of galleryComponents) {
    for (const path of placesComponent(component)) {
      const list = byPath.get(path) ?? []
      list.push(component)
      byPath.set(path, list)
    }
  }
  return byPath
}

/** The Canonical categories, which name what a piece is used for. */
const useCategories =
  galleryTypes.find((bucket) => bucket.groupBy === "canonical")?.children ?? []

/** Splits a tier's cards into labeled groups by their `canonical` use. */
function groupsCardsByUse(cards: GalleryCard[]): GalleryCategory[] {
  return useCategories
    .map((use) => ({
      id: use.id,
      name: use.label,
      cards: cards.filter((card) => card.canonical === use.id),
    }))
    .filter((group) => group.cards.length > 0)
}

/** Walks the type tree and fills each category with its components. Empty branches are dropped. */
function buildsGalleryBuckets(): GalleryBucket[] {
  const byPath = groupsComponentsByPath()

  if (process.env.NODE_ENV !== "production") {
    const known = new Set(
      galleryTypes.flatMap((bucket) =>
        (bucket.children ?? []).map((category) => `${bucket.id}/${category.id}`)
      )
    )
    for (const [path, components] of byPath) {
      if (!known.has(path)) {
        console.warn(
          `galleryComponents.json: unknown category "${path}" on ${components.map((c) => c.name).join(", ")}`
        )
      }
    }
  }

  return galleryTypes
    .map((bucket) => ({
      id: bucket.id,
      name: bucket.label,
      groupBy: bucket.groupBy ?? "type",
      categories: (bucket.children ?? [])
        .map((category) => {
          const cards = byPath.get(`${bucket.id}/${category.id}`) ?? []
          return {
            id: category.id,
            name: category.label,
            cards,
            ...(bucket.groupBy === "tier"
              ? { groups: groupsCardsByUse(cards) }
              : {}),
          }
        })
        .filter((category) => category.cards.length > 0),
    }))
    .filter((bucket) => bucket.categories.length > 0)
}

export const galleryBuckets: GalleryBucket[] = buildsGalleryBuckets()

export function toPieceSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-")
}

export function findPiece(pieceSlug: string) {
  for (const bucket of galleryBuckets) {
    for (const category of bucket.categories) {
      for (const card of category.cards) {
        if (toPieceSlug(card.name) === pieceSlug) {
          return { bucket, category, card }
        }
      }
    }
  }

  return null
}

export function findComponent(name: string) {
  return galleryComponents.find((component) => component.name === name)
}
