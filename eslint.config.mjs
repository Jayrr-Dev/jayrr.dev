import { plugin as shadcn } from "@shadcn/lint";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import { standardLint } from "./lib/standard-lint.mjs";

// @shadcn/lint (docs/lint-rollout.md). lib/standard-lint.mjs holds the rules
// consumers get, and ships in the registry as @jayrr/standard-lint; the blocks
// after it are this repo's own layers and exceptions.
const ui = ["@/components/ui", "@/components/standard"];
const note = "See docs/component-conventions.md.";
const shadcnSettings = { shadcn: { ui, note } };

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // eslint-plugin-react's "detect" calls context.getFilename(), which ESLint 10
  // removed, so name the installed React version instead.
  {
    settings: {
      react: { version: "19.2.8" },
    },
  },
  // Consumers: code that uses the design system.
  ...standardLint({
    ui,
    note,
    files: ["app/**/*.{ts,tsx}", "features/**/*.{ts,tsx}", "components/*.{ts,tsx}"],
  }),
  // Standard: the design system, published to the registry. Components style
  // themselves, so no-restyle, require-static-classes and no-inline-styles stay
  // off (dynamic geometry and user-picked colors are their job). What matters
  // for installers is that colors follow their theme and every class resolves.
  // Off-scale values render the same anywhere, so they stay a warning.
  {
    files: ["components/standard/**/*.{ts,tsx}"],
    plugins: { shadcn },
    settings: shadcnSettings,
    rules: {
      // fill-none is valid Tailwind that the rule reads as an undeclared color.
      "shadcn/no-raw-colors": ["error", { allow: ["fill-none"] }],
      "shadcn/no-arbitrary-values": "warn",
      // mood-text styles its own mood-* hooks in a <style> element.
      "shadcn/no-unknown-classes": ["error", { allow: ["mood-*"] }],
    },
  },
  // Syntax-highlight palettes are a fixed code color scheme, not theme colors.
  {
    files: [
      "components/standard/json-display.tsx",
      "components/standard/json-viewer.tsx",
      "components/standard/spreadsheet.tsx",
      "features/standard-library/components/demos/pieces/input-calculator.tsx",
    ],
    rules: {
      "shadcn/no-raw-colors": "off",
    },
  },
  // Demo imagery: placeholder photos, illustrations, brand tiles and art whose
  // hues are the content, so they don't follow the theme.
  {
    files: [
      "features/standard-library/components/demos/pieces/card.tsx",
      "features/standard-library/components/demos/pieces/hero-card.tsx",
      "features/standard-library/components/demos/pieces/parallax.tsx",
      "features/standard-library/components/demos/pieces/list.tsx",
      "features/standard-library/components/demos/pieces/infinite-canvas.tsx",
      "features/standard-library/components/demos/rendersStandardArticleDemo.tsx",
      "features/standard-library/components/demos/rendersStandardBentoGridDemo.tsx",
      "features/standard-library/components/demos/rendersStandardCharacterChatDemo.tsx",
      "features/standard-library/components/demos/rendersStandardFloatingWindowDemo.tsx",
    ],
    rules: {
      "shadcn/no-raw-colors": "off",
    },
  },
  // The character art's backdrops are hex gradients.
  {
    files: ["features/standard-library/components/demos/rendersStandardCharacterChatDemo.tsx"],
    rules: {
      "shadcn/no-arbitrary-values": "off",
    },
  },
  // Vendored shadcn source: overwritten on re-add, so only catch dead classes.
  {
    files: ["components/ui/**/*.{ts,tsx}"],
    plugins: { shadcn },
    settings: shadcnSettings,
    rules: {
      // Hook classes that shadcn's own CSS or sonner target.
      "shadcn/no-unknown-classes": ["warn", { allow: ["cn-input-otp", "toaster"] }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Agent worktrees are full repo copies.
    ".claude/**",
  ]),
]);

export default eslintConfig;
