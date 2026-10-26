import type { Metadata } from "next"
import { ArrowUpRightIcon } from "lucide-react"

import { focus, links, profile, projects, skills } from "@/app/content"
import { Heading } from "@/components/standard/heading"
import { Link } from "@/components/standard/link"
import { ModeToggle } from "@/components/standard/mode-toggle"
import { Paragraph } from "@/components/standard/paragraph"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: `${profile.name} | ${profile.role}`,
  description: profile.about,
}

export default function Page() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 pt-6">
        <p className="font-mono text-xs text-muted-foreground">jayrr.dev</p>
        <ModeToggle variant="toggle" tone="ghost" />
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-20 px-6 py-16 md:py-24">
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Paragraph size="muted">{profile.role}</Paragraph>
            <Heading level={1} display>
              {profile.name}
            </Heading>
            <Paragraph size="lead">{profile.intro}</Paragraph>
          </div>
          <Paragraph tone="muted">{profile.about}</Paragraph>
          <div className="flex flex-wrap gap-2">
            {links.map((link) => (
              <Button key={link.href} variant="outline" size="sm" asChild>
                <a href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                  <ArrowUpRightIcon data-icon="inline-end" />
                </a>
              </Button>
            ))}
          </div>
        </section>

        <section id="projects" className="flex flex-col gap-6">
          <Heading level={2}>Projects</Heading>
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <Card key={project.name}>
                <CardHeader>
                  <CardTitle>
                    <a href={project.href} target="_blank" rel="noreferrer">
                      {project.name}
                    </a>
                  </CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                  <div className="flex w-full flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {project.source ? (
                      <Link
                        href={project.source}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Source
                      </Link>
                    ) : null}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <section id="about" className="flex flex-col gap-6">
          <Heading level={2}>What I build</Heading>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-muted-foreground">
            {focus.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-3xl px-6 pb-10">
        <Paragraph size="muted">
          The component library that used to live here is now{" "}
          <Link href="https://standardsui.com">Standards UI</Link>.
        </Paragraph>
      </footer>
    </div>
  )
}
