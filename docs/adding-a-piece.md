# Adding a piece

A piece is no longer just a `.tsx` file. The gallery, the registry JSON, the
props/examples docs and the MCP server all read from it, so a new piece isn't
done until every surface below has it. Most of these surfaces are generated, so
the hand-written parts are what matter.

Use Tutorial Float (`c667ffc`) as the reference commit for the file footprint.

## 1. The component — `components/standard/<name>.tsx`

- Follow [component-conventions.md](component-conventions.md): `leading` /
  `trailing` slots, `label` vs `aria-label`, the tone vocabulary, theme tokens
  (never palette colors), the size scale.
- Export a named props type for every exported component, and put a JSDoc
  comment on each prop that isn't obvious. `scripts/writesItemDocs.mjs` reads
  these types and comments into `public/r/docs/<name>.json`, and
  `registry_get_item` returns them to agents. An undocumented prop shows up to
  an agent as a bare type.
- Compose existing Standard pieces (`@/components/standard/button`) instead of
  restyling primitives. Import `cn` from `@/lib/utils`.
- Respect `prefers-reduced-motion` if the piece animates.

## 2. Registry entry — `components/standard/registry.json`

- `name` (kebab-case; `writesRegistryIndex.mjs` publishes a name that clashes
  with Classic as `standard-<name>`), `title`, and a full `description`. The
  description is what `registry_search` matches against, so name the
  behaviours and use cases an agent would search for.
- Run `node scripts/writesRegistryIndex.mjs`. It fills `files` and
  `registryDependencies` (including `standard-tokens` for tone classes) and
  keeps hand-written fields.

## 3. Gallery

| File | What to add |
| --- | --- |
| `features/ui-library/domain/catalog/galleryComponents.json` | Entry with `name`, `type` / `canonical` / `tier` from `galleryTypes.json`, `demos: ["standard"]`, `key`, `family_key`, `file_path`, `import_path`. No `description` here. |
| `features/ui-library/domain/catalog/shortDescriptions.json` | One-line card description, under the piece's tier. |
| `features/standard-library/components/demos/pieces/<name>.tsx` | Demos built from `RendersDemoCard`. |
| `features/standard-library/components/demos/definesStandardPieceDemos.ts` | Import the demo and add it to `STANDARD_PIECE_DEMOS`. |
| `components/gallery-icon.tsx` | An icon keyed by the piece's display name. |

Demos double as agent examples: `writesItemDocs.mjs` picks up to four demo
cards that cover the most props, so keep each card short (under ~80 lines)
and make the set exercise the props, not just the default look.

If the registry item has a different name from the gallery piece, add the
alias in `features/ui-library/domain/catalog/resolvesInstallItems.ts`.

## 4. Build the generated files

```bash
npm run registry:build
```

This writes `public/r/<name>.json`, `public/r/registry.json` and
`public/r/docs/<name>.json`. Commit them with the piece; the MCP server reads
`public/r` and won't see the piece otherwise.

## 5. Check

```bash
npm run check
```

That runs lint (fix every `shadcn/*` error, don't add suppressions),
typecheck and `registry validate`. Then, with the dev server running:

```bash
node scripts/checksGalleryPages.mjs --port <port> --pieces "<Display Name>"
```

It checks the catalog entry, the demo key and the short description, and
that `/gallery/<slug>` renders. Finally confirm agents can find it: call
`registry_search` for the piece and `registry_get_item` on it against
`http://localhost:<port>/mcp`, and check the props and examples look right.

## Done means

- [ ] Component follows the conventions; props typed and documented
- [ ] Registry entry with a searchable description; index regenerated
- [ ] Gallery entry, short description, demos, demo key, icon
- [ ] `npm run registry:build` output committed (`public/r/…`, `public/r/docs/…`)
- [ ] `npm run check` passes; gallery page check passes
- [ ] MCP search and get_item return the piece with props and examples

When a new surface lands (per-piece `.md` pages and `llms.txt`, agent evals,
the MCP Apps bridge), add its step here in the same change.
