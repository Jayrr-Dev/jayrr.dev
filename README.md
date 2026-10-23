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

## MCP server

`https://jayrr.dev/mcp` is a read-only MCP server over the registry, so coding agents can find and install pieces without browsing the gallery. It speaks stateless Streamable HTTP and needs no auth. The route is `app/mcp/route.ts` and the tools live in `features/registry-mcp`.

| Tool | What it does |
| --- | --- |
| `registry_search` | Keyword search over names, titles and descriptions, filtered by `set` (classic, standard, hook, lib) and `tier`, paginated. |
| `registry_get_item` | Install command, dependencies, files and gallery link for one item, plus its props and gallery examples by default. `include` picks the sections: `props`, `examples`, `source`. |
| `registry_get_conventions` | `docs/component-conventions.md`, also exposed as the resource `jayrr://docs/component-conventions`. |

Add it to Claude Code:

```bash
claude mcp add --transport http jayrr https://jayrr.dev/mcp
```

Or in a project's `.mcp.json`:

```json
{
  "mcpServers": {
    "jayrr": { "type": "http", "url": "https://jayrr.dev/mcp" }
  }
}
```

Props and examples come from `public/r/docs/<item>.json`, which `scripts/writesItemDocs.mjs` writes at the end of `registry:build`. Props are read from each exported component's TypeScript props (own props only; pass-through groups such as `HTMLAttributes` are listed under `inherits`). Examples are the gallery's demo cards: the item's own demos first, picked to cover the most props, with the imports and any data they use.

It reads `public/r`, so run `npm run registry:build` before deploying for the server to see new pieces. Locally it runs at `http://localhost:<port>/mcp` under `npm run dev`.

## Convex

Local backend:

```bash
npx convex dev
```

That writes `NEXT_PUBLIC_CONVEX_URL` to `.env.local`. Run `npx convex login` if you want the local deployment linked to a Convex project.
