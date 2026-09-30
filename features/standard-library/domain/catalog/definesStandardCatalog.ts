import { findComponent } from "@/features/ui-library/domain/catalog/definesGalleryCatalog"

export type StandardCatalogEntry = {
  component_key: string
  component_name: string
  section_key: string
  category_key: string
}

/** Looks up a Standard piece in the shared component pool. */
export function findStandardCatalogEntry(
  pieceName: string
): StandardCatalogEntry | undefined {
  const component = findComponent("standard", pieceName)
  if (!component) {
    return undefined
  }

  const [, section_key = "", category_key = ""] = component.type.split("/")
  return {
    component_key: component.key ?? pieceName,
    component_name: component.name,
    section_key,
    category_key,
  }
}
