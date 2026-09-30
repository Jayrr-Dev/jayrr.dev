"use client"

import {
  Article,
  ArticleAside,
  ArticleContent,
  ArticleEyebrow,
  ArticleFigure,
  ArticleFigureCaption,
  ArticleFooter,
  ArticleHeader,
  ArticleLead,
  ArticleMeta,
  ArticleSection,
  ArticleSectionTitle,
  ArticleTitle,
} from "@/components/standard/article"
import { Avatar } from "@/components/standard/avatar"
import { Image } from "@/components/standard/image"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

function RendersSwatch({ className }: { className: string }) {
  return <div className={`size-full ${className}`} />
}

const tocLinks = ["Overview", "Anatomy", "Differences from M2", "Usage"]

export function RendersStandardArticleDemo() {
  return (
    <div data-fill className="flex w-full flex-col gap-3">
      <RendersDemoCard fill label='layout "single" — blog post'>
        <Article>
          <ArticleHeader>
            <ArticleEyebrow>Field notes</ArticleEyebrow>
            <ArticleTitle>Scheduling crews without the spreadsheet</ArticleTitle>
            <ArticleLead>
              What changed when we moved dispatch into one shared board.
            </ArticleLead>
            <ArticleMeta>
              <Avatar size="sm">JR</Avatar>
              <span>Jayrr</span>
              <span aria-hidden>·</span>
              <time dateTime="2026-09-29">Sep 29, 2026</time>
              <span aria-hidden>·</span>
              <span>6 min read</span>
            </ArticleMeta>
          </ArticleHeader>

          <ArticleContent>
            <p>
              Every Monday started the same way: three versions of the same
              sheet, and a phone call to find out which one was true. Plain
              markup inside <code>ArticleContent</code> picks up reading
              styles automatically.
            </p>
            <ArticleFigure bleed="wide">
              <Image ratio="wide">
                <RendersSwatch className="bg-linear-to-br from-sky-400 to-indigo-600" />
              </Image>
              <ArticleFigureCaption>
                bleed=&quot;wide&quot; steps out past the reading measure.
              </ArticleFigureCaption>
            </ArticleFigure>
            <h2>One board, one truth</h2>
            <p>
              The board replaced the sheet, not the conversation. Crews still
              call — they just call about the job, not about{" "}
              <a href="#">which sheet</a> is current.
            </p>
            <blockquote>
              “I stopped being a switchboard and started being a planner.”
            </blockquote>
            <ul>
              <li>Jobs are dragged, not retyped.</li>
              <li>Conflicts show up before Monday, not during it.</li>
            </ul>
            <ArticleFigure bleed="full">
              <Image ratio="wide" className="aspect-[21/9]">
                <RendersSwatch className="bg-linear-to-r from-amber-300 via-rose-400 to-fuchsia-600" />
              </Image>
              <ArticleFigureCaption>
                bleed=&quot;full&quot; runs edge to edge.
              </ArticleFigureCaption>
            </ArticleFigure>
          </ArticleContent>

          <ArticleFooter>Filed under Operations</ArticleFooter>
        </Article>
      </RendersDemoCard>

      <RendersDemoCard fill label='section layout "split" — spec page'>
        <Article measure="wide">
          <ArticleContent>
            <ArticleSection layout="split">
              <ArticleSectionTitle>Differences from M2</ArticleSectionTitle>
              <ul>
                <li>Color: new color mappings and dynamic color support</li>
                <li>
                  Layout: greater padding for the larger radius and title
                </li>
                <li>Position: option for custom dialog positioning</li>
                <li>Shape: increased corner radius</li>
                <li>Typography: larger and darker headline</li>
              </ul>
              <ArticleFigure>
                <Image ratio="still">
                  <RendersSwatch className="bg-linear-to-br from-violet-200 to-fuchsia-100 dark:from-violet-900 dark:to-fuchsia-950" />
                </Image>
                <ArticleFigureCaption>
                  New updates to color, layout, position, shape, and
                  typography
                </ArticleFigureCaption>
              </ArticleFigure>
            </ArticleSection>

            <ArticleSection layout="split-reverse">
              <ArticleSectionTitle>Anatomy</ArticleSectionTitle>
              <p>
                split-reverse puts the last pane first on wide screens and
                keeps DOM order when stacked.
              </p>
              <ArticleFigure>
                <Image ratio="still">
                  <RendersSwatch className="bg-linear-to-br from-emerald-200 to-teal-400 dark:from-emerald-900 dark:to-teal-700" />
                </Image>
              </ArticleFigure>
            </ArticleSection>
          </ArticleContent>
        </Article>
      </RendersDemoCard>

      <RendersDemoCard fill label='layout "sidebar" — docs with contents'>
        <Article layout="sidebar">
          <ArticleHeader>
            <ArticleEyebrow>Components</ArticleEyebrow>
            <ArticleTitle>Dialogs</ArticleTitle>
            <ArticleLead>
              Dialogs provide important prompts in a user flow.
            </ArticleLead>
          </ArticleHeader>

          <ArticleContent>
            <ArticleSection>
              <h2 id="overview">Overview</h2>
              <p>
                The aside sits beside the content once the container is wide
                enough, and sticks while the content scrolls.
              </p>
              <h3>Basic dialog</h3>
              <p>
                Below the breakpoint the aside falls back into DOM order,
                after the content.
              </p>
            </ArticleSection>
          </ArticleContent>

          <ArticleAside>
            <p className="font-medium">On this page</p>
            <nav className="flex flex-col gap-2 border-l border-border pl-3">
              {tocLinks.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {link}
                </a>
              ))}
            </nav>
          </ArticleAside>
        </Article>
      </RendersDemoCard>

      <RendersDemoCard fill label='layout "sidebar-start", measure "narrow"'>
        <Article layout="sidebar-start" measure="narrow">
          <ArticleHeader>
            <ArticleTitle className="text-3xl @2xl:text-4xl">
              Release notes
            </ArticleTitle>
          </ArticleHeader>
          <ArticleAside sticky={false}>
            <p className="font-medium">Versions</p>
            <p className="text-muted-foreground">1.4 · 1.3 · 1.2</p>
          </ArticleAside>
          <ArticleContent>
            <h2>1.4</h2>
            <ol>
              <li>Article layout component.</li>
              <li>Bento grid presets.</li>
            </ol>
          </ArticleContent>
          <ArticleFooter>Updated weekly</ArticleFooter>
        </Article>
      </RendersDemoCard>
    </div>
  )
}
