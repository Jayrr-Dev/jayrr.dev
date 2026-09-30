"use client"

import { Math as MathFormula } from "@/components/ui/math"
import { RendersDemoCard } from "@/features/ui-library/components/demos/rendersDemoCard"

export function RendersMathDemo() {
  return (
    <>
      <RendersDemoCard label="display · quadratic formula">
        <MathFormula display tex={String.raw`x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}`} />
      </RendersDemoCard>
      <RendersDemoCard label="display · gaussian integral">
        <MathFormula display tex={String.raw`\int_0^{\infty} e^{-x^2}\,dx = \frac{\sqrt{\pi}}{2}`} />
      </RendersDemoCard>
      <RendersDemoCard label="display · series">
        <MathFormula display tex={String.raw`\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}`} />
      </RendersDemoCard>
      <RendersDemoCard label="display · matrix">
        <MathFormula
          display
          tex={String.raw`\det \begin{bmatrix} a & b \\ c & d \end{bmatrix} = ad - bc`}
        />
      </RendersDemoCard>
      <RendersDemoCard label="inline">
        <p className="text-sm">
          Euler&apos;s identity <MathFormula tex={String.raw`e^{i\pi} + 1 = 0`} /> ties
          together five constants, and <MathFormula tex={String.raw`E = mc^2`} /> fits
          in a sentence.
        </p>
      </RendersDemoCard>
      <RendersDemoCard label="invalid tex · shown in red">
        <MathFormula display tex={String.raw`\frac{1}{`} />
      </RendersDemoCard>
    </>
  )
}
