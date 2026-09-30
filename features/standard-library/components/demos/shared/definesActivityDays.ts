/**
 * Seeded mock activity so the server and browser draw the same map: busier
 * on weekdays, with quiet stretches and the odd burst.
 */

/** Fixed so the demo never disagrees with itself across a render. */
export const DEMO_ACTIVITY_END = "2026-09-29"

function seeds(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 2 ** 32
  }
}

function keys(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

export function definesActivityDays({
  days = 371,
  seed = 7,
  end = DEMO_ACTIVITY_END,
  busy = 1,
}: {
  days?: number
  seed?: number
  end?: string
  /** Scales every count. */
  busy?: number
} = {}) {
  const random = seeds(seed)
  const [year, month, day] = end.split("-").map(Number)
  const data: Record<string, number> = {}
  let quiet = 0
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(year, month - 1, day - offset)
    if (quiet > 0) {
      quiet -= 1
      continue
    }
    if (random() < 0.03) {
      quiet = Math.floor(random() * 9)
      continue
    }
    const weekend = date.getDay() === 0 || date.getDay() === 6
    const chance = weekend ? 0.35 : 0.8
    if (random() > chance) {
      continue
    }
    const burst = random() < 0.06 ? 3 : 1
    data[keys(date)] = Math.max(
      1,
      Math.round(random() * (weekend ? 4 : 9) * burst * busy)
    )
  }
  return data
}
