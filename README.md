# jayrr.dev

Next.js site for the Jayrr shadcn registry. Components are static JSON under `public/r`. Convex is wired for later features and is not used by the registry.

## Registry

Build the JSON files after you change `registry.json` or a component:

```bash
npx shadcn@latest registry validate
npx shadcn@latest build
```

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
