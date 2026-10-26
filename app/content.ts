// Everything the home page says. Edit here; app/page.tsx only lays it out.

export const profile = {
  name: "Jayrr Dev",
  role: "Full-stack developer",
  intro: "Building with AI made simple.",
  about:
    "I have spent 7 years building modern web apps with Next.js, React and TypeScript. Most of that work is private: SaaS products, internal tools and client apps. I also teach how to build with AI for your business.",
}

export const skills = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Supabase",
  "Convex",
  "Tailwind",
  "Vercel",
]

export const focus = [
  "Private SaaS: billing, auth, dashboards and the rest of the product work",
  "Internal tools that staff use every day",
  "AI product features: agents, workflows, ranking and visual teaching tools",
  "Desktop utilities when a browser is the wrong place",
]

export type Project = {
  name: string
  description: string
  tags: string[]
  href: string
  source?: string
}

export const projects: Project[] = [
  {
    name: "Standards UI",
    description:
      "A component library and shadcn registry, with lint rules that keep apps on the design system and an MCP server for AI agents.",
    tags: ["React", "shadcn", "Design system"],
    href: "https://standardsui.com",
  },
  {
    name: "JayrrVideos",
    description:
      "A free and open source whiteboard for drawing hand-drawn style diagrams. Based on Excalidraw.",
    tags: ["Open source", "Whiteboard"],
    href: "https://jayrr-videos.vercel.app",
    source: "https://github.com/Jayrr-Dev/JayrrVideos",
  },
  {
    name: "JayrrBudget",
    description:
      "A personal budget ledger. Upload a statement, sort the charges, and keep each login on its own books.",
    tags: ["Next.js", "Finance"],
    href: "https://jayrr-budget.vercel.app",
    source: "https://github.com/Jayrr-Dev/JayrrBudget",
  },
  {
    name: "Second Brain Engine",
    description: "A place to collect notes and ideas and connect them.",
    tags: ["AI", "Notes"],
    href: "https://second-brain-engine-navy.vercel.app",
    source: "https://github.com/Jayrr-Dev/second-brain-engine",
  },
  {
    name: "Dyslexia TTS",
    description:
      "A Cursor and VS Code extension that reads selected code or chat aloud with Windows voices. Press Alt+X. No API key.",
    tags: ["VS Code", "Accessibility"],
    href: "https://github.com/Jayrr-Dev/dyslexia-tts-cursor-extension",
  },
  {
    name: "Reigncraft",
    description: "A game built on Reddit's Devvit platform.",
    tags: ["Game", "Reddit"],
    href: "https://github.com/Jayrr-Dev/reigncraft",
  },
]

export const links = [
  { label: "GitHub", href: "https://github.com/Jayrr-Dev" },
  { label: "YouTube", href: "https://www.youtube.com/@jayrrdev" },
  { label: "X", href: "https://x.com/JayrrDev" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/samuelsoriano/" },
]
