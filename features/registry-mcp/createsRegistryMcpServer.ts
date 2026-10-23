import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import {
  findsEntry,
  installCommandFor,
  readsConventions,
  readsItemDocs,
  readsItemSource,
  registryEntries,
  searchesEntries,
  suggestsNames,
  type RegistryEntry,
} from "./domain/indexesRegistry"

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const

const CONVENTIONS_URI = "jayrr://docs/component-conventions"

const asText = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
})

const asError = (message: string) => ({
  content: [{ type: "text" as const, text: message }],
  isError: true,
})

function summarizes(entry: RegistryEntry) {
  return {
    name: entry.name,
    title: entry.title,
    set: entry.set,
    tier: entry.tier,
    description: entry.description,
  }
}

/**
 * A read-only MCP server over the jayrr registry. One is built per request:
 * the route runs stateless, so nothing outlives a call.
 */
export function createsRegistryMcpServer() {
  const server = new McpServer(
    { name: "jayrr-registry", version: "1.0.0" },
    {
      instructions: [
        "Look up and install components from the jayrr.dev shadcn registry.",
        "Start with registry_search, then registry_get_item for install details and source.",
        "Items come in two sets: classic (shadcn-style, components/ui) and standard (jayrr's own pieces, components/standard). Prefer standard unless the user asks for classic.",
        "Before writing code that uses standard components, read registry_get_conventions for prop names (leading/trailing slots, tone vocabulary, theme tokens).",
      ].join("\n"),
    }
  )

  server.registerTool(
    "registry_search",
    {
      title: "Search the jayrr registry",
      description:
        "Find components, hooks and blocks in the jayrr.dev registry by keyword, e.g. 'date picker', 'carousel', 'toast'. " +
        "Matches names, titles and descriptions, best match first. Leave query empty to browse everything. " +
        "Returns names to pass to registry_get_item.",
      inputSchema: {
        query: z
          .string()
          .default("")
          .describe("Keywords; several short searches beat one long one."),
        set: z
          .enum(["classic", "standard", "hook", "lib"])
          .optional()
          .describe(
            "classic = shadcn-style primitives, standard = jayrr's own pieces, hook = React hooks, lib = utilities."
          ),
        tier: z
          .enum(["primitive", "component", "block"])
          .optional()
          .describe(
            "primitive = one element (Button), component = parts working as one unit (Filter Select), block = a full section (App Bar)."
          ),
        limit: z.number().int().min(1).max(50).default(10),
        offset: z.number().int().min(0).default(0),
      },
      annotations: READ_ONLY,
    },
    async ({ query, set, tier, limit, offset }) => {
      const pool = registryEntries.filter(
        (entry) => (!set || entry.set === set) && (!tier || entry.tier === tier)
      )
      const matches = searchesEntries(query, pool)
      const page = matches.slice(offset, offset + limit)

      if (matches.length === 0) {
        return asText({
          total: 0,
          items: [],
          hint: "No matches. Try a shorter or more general keyword, or drop the set/tier filter.",
        })
      }

      return asText({
        total: matches.length,
        offset,
        items: page.map(summarizes),
        ...(offset + page.length < matches.length && {
          next_offset: offset + page.length,
        }),
      })
    }
  )

  server.registerTool(
    "registry_get_item",
    {
      title: "Get a registry item",
      description:
        "How to install and use one item, by its exact name from registry_search (e.g. 'button', 'standard-badge'). " +
        "Always returns the install command, dependencies, files and gallery link. " +
        "By default it adds `props` (each exported component's own props with types, defaults and notes; `inherits` names pass-through groups like HTMLAttributes) " +
        "and `examples` (gallery demos with their imports and any setup data). " +
        "Add 'source' to `include` only when you need to read or change the implementation; it can be long.",
      inputSchema: {
        name: z.string().min(1).describe("Exact item name, e.g. 'text-field'."),
        include: z
          .array(z.enum(["props", "examples", "source"]))
          .default(["props", "examples"])
          .describe("Extra sections. [] returns only the install details."),
      },
      annotations: READ_ONLY,
    },
    async ({ name, include }) => {
      const entry = findsEntry(name)

      if (!entry) {
        const suggestions = suggestsNames(name)

        return asError(
          `No registry item named "${name}".` +
            (suggestions.length
              ? ` Did you mean: ${suggestions.join(", ")}?`
              : " Use registry_search to find the right name.")
        )
      }

      const docs =
        include.includes("props") || include.includes("examples")
          ? await readsItemDocs(entry)
          : null

      return asText({
        ...summarizes(entry),
        install: installCommandFor(entry.name),
        dependencies: entry.dependencies,
        registryDependencies: entry.registryDependencies,
        gallery: entry.galleryUrl,
        ...(include.includes("props") &&
          docs?.components.length && { props: docs.components }),
        ...(include.includes("examples") &&
          docs?.examples.length && { examples: docs.examples }),
        files: include.includes("source")
          ? await readsItemSource(entry)
          : entry.files,
      })
    }
  )

  server.registerTool(
    "registry_get_conventions",
    {
      title: "Get component conventions",
      description:
        "The rules standard components follow: slot names (leading/trailing), labels, the shared tone vocabulary and the theme tokens each tone maps to. Read before composing standard components.",
      annotations: READ_ONLY,
    },
    async () => ({
      content: [{ type: "text" as const, text: await readsConventions() }],
    })
  )

  server.registerResource(
    "component-conventions",
    CONVENTIONS_URI,
    {
      title: "Component conventions",
      description: "Slot, label, tone and token rules for standard components.",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: await readsConventions(),
        },
      ],
    })
  )

  return server
}
