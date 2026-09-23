# jayrr.dev

Next.js site for the Jayrr shadcn registry. Components are static JSON under `public/r`. Convex is wired for later features and is not used by the registry.

## Registry

The catalog is split the way shadcn expects. The root `registry.json` only points at the folders. Each folder owns its own list:

- `components/ui/registry.json` for the Classic (shadcn) UI library
- `components/standard/registry.json` for the Standard library
- `hooks/registry.json` for hooks such as `use-mobile`

After you add or change a component, rebuild the index and the public JSON:

```bash
node scripts/writesRegistryIndex.mjs
npx shadcn@latest registry validate
npx shadcn@latest build
```

`build` writes `public/r/registry.json` and one file per item, such as `public/r/button.json`. A Classic UI file is recorded as `components/ui/button.tsx`. A Standard file is recorded as `components/standard/heading.tsx`. Names that already exist in Classic are published as `standard-button`, `standard-card`, and so on, so they do not overwrite the shadcn files. A hook lands in `hooks`.

Public URLs:

- Catalog: `https://jayrr.dev/r/registry.json`
- Item: `https://jayrr.dev/r/button.json`

Consumers add the namespace, then install items:

```bash
npx shadcn@latest registry add @jayrr=https://jayrr.dev/r/{name}.json
npx shadcn@latest add @jayrr/button
```

Or set this in `components.json`:

```json
{
  "registries": {
    "@jayrr": "https://jayrr.dev/r/{name}.json"
  }
}
```

## Convex

Local backend:

```bash
npx convex dev
```

That writes `NEXT_PUBLIC_CONVEX_URL` to `.env.local`. Run `npx convex login` if you want the local deployment linked to a Convex project.
