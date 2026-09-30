# Component conventions

Rules for Standard components (`components/standard/*`) and their gallery
entries. New work follows them; older props stay working as deprecated aliases
until callers move.

## Slots

- Content placed before or after a component's main content goes in
  `leading` and `trailing`.
- Older slot props stay as deprecated aliases that map onto the new ones:
  `icon` + `iconPosition`, `image` + `imagePosition`, and
  `leadingIcon` / `trailingIcon`. Keep them working and mark them
  `/** @deprecated Use leading / trailing */`.

## Labels

- `label` is always visible text.
- Icon-only controls take `aria-label` for their accessible name. They do not
  use `label` for it.

## Tone

One vocabulary for every component that takes a tone:

`default | quiet | outline | ghost | success | warning | info | danger`

A component supports the subset that makes sense for it, and does not invent
other names for the same idea.

## Size

Scale: `xs | sm | default | lg | xl`.

Fields, selects and buttons share heights so they line up in a row:

| size      | height |
| --------- | ------ |
| `sm`      | `h-7`  |
| `default` | `h-8`  |
| `lg`      | `h-9`  |

## Data components

Components that render a list of things (menus, tabs, selects, arrays of
buttons) accept either an `items` array or composed children.

## Controlled state

- Single value: `value`, `defaultValue`, `onValueChange`.
- Multiple values: `values`, `defaultValues`, `onValuesChange`.
- Implement both with `useControllableState` from
  `hooks/use-controllable-state.ts`, so a component is controlled when the
  parent passes `value` and keeps its own state otherwise.

## Deprecation

When a component is merged into another, it stays in its original file as a
thin wrapper:

- same export name and same props, so every import keeps working;
- it renders the component it was merged into with the matching prop;
- it is marked `/** @deprecated Use <X prop> */`, naming the replacement,
  e.g. `/** @deprecated Use <Button tone="danger"> */`.

Exports that moved to their own file leave a re-export in the old file.

## Gallery catalog

Every entry in `features/ui-library/domain/catalog/galleryComponents.json`
keeps a valid `type`, `canonical` and `tier`, each resolving to a category in
`galleryTypes.json`. Names are unique.

An entry with `"standard"` in `demos` has a demo in
`features/standard-library/components/demos/pieces/<slug>.tsx`, registered by
piece name in `definesStandardPieceDemos.ts`. A piece demo takes no hooks at
its top level: the gallery calls it as a plain function, so stateful parts go
in child components it renders.

Check with:

```sh
node scripts/checksGalleryPages.mjs --port 3200
```
