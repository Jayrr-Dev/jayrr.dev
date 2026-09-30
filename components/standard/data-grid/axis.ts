// Layout: prefix sums per axis so a 100k-row grid finds its window with a
// binary search instead of walking every row.

export type Axis = {
  count: number
  sizes: Float64Array
  /** Offset inside the item's zone (frozen or scrolling), or -1 when hidden. */
  offsets: Float64Array
  frozenCount: number
  frozen: number[]
  scroll: number[]
  scrollStarts: number[]
  frozenSize: number
  scrollSize: number
  /** Visible indices in order: the frozen ones, then the scrolling ones. */
  visible: number[]
  /** Index → position in `visible`, or -1 when hidden. */
  visiblePos: Int32Array
}

export function buildAxis<T extends { hidden?: boolean }>(
  items: T[],
  sizeOf: (item: T, index: number) => number,
  frozenCount: number,
  excluded?: Uint8Array | null
): Axis {
  const count = items.length
  const sizes = new Float64Array(count)
  const offsets = new Float64Array(count).fill(-1)
  const visiblePos = new Int32Array(count).fill(-1)
  const frozen: number[] = []
  const scroll: number[] = []
  const scrollStarts: number[] = []
  const pinned = Math.min(Math.max(frozenCount, 0), count)
  let frozenSize = 0
  let scrollSize = 0
  items.forEach((item, index) => {
    sizes[index] = sizeOf(item, index)
    if (item.hidden || excluded?.[index]) {
      return
    }
    if (index < pinned) {
      offsets[index] = frozenSize
      frozenSize += sizes[index]
      frozen.push(index)
    } else {
      offsets[index] = scrollSize
      scrollStarts.push(scrollSize)
      scrollSize += sizes[index]
      scroll.push(index)
    }
  })
  const visible = [...frozen, ...scroll]
  visible.forEach((index, position) => {
    visiblePos[index] = position
  })
  return {
    count,
    sizes,
    offsets,
    frozenCount: pinned,
    frozen,
    scroll,
    scrollStarts,
    frozenSize,
    scrollSize,
    visible,
    visiblePos,
  }
}

/** Scrolling items that overlap [start, start + length), plus overscan. */
export function windowOf(
  axis: Axis,
  start: number,
  length: number,
  overscan: number
) {
  const { scrollStarts, scroll, sizes } = axis
  let low = 0
  let high = scrollStarts.length
  while (low < high) {
    const middle = (low + high) >> 1
    if (scrollStarts[middle] + sizes[scroll[middle]] <= start) {
      low = middle + 1
    } else {
      high = middle
    }
  }
  let last = low
  while (last < scrollStarts.length && scrollStarts[last] < start + length) {
    last += 1
  }
  return scroll.slice(
    Math.max(0, low - overscan),
    Math.min(scroll.length, last + overscan)
  )
}

export function firstVisibleIn(axis: Axis, from: number, to: number) {
  for (let index = from; index <= to; index += 1) {
    if (axis.visiblePos[index] >= 0) {
      return index
    }
  }
  return -1
}

export function lastVisibleIn(axis: Axis, from: number, to: number) {
  for (let index = to; index >= from; index -= 1) {
    if (axis.visiblePos[index] >= 0) {
      return index
    }
  }
  return -1
}

/** Position in `visible` of `index`, or of the nearest visible item after (then before) it. */
export function nearestVisiblePos(axis: Axis, index: number) {
  if (axis.visible.length === 0) {
    return -1
  }
  for (let at = index; at < axis.count; at += 1) {
    if (axis.visiblePos[at] >= 0) {
      return axis.visiblePos[at]
    }
  }
  for (let at = index - 1; at >= 0; at -= 1) {
    if (axis.visiblePos[at] >= 0) {
      return axis.visiblePos[at]
    }
  }
  return -1
}

/** Ctrl+arrow: jump to the edge of the current block of filled cells, or to the next one. */
export function jumpPos(
  visible: number[],
  from: number,
  step: 1 | -1,
  filled: (index: number) => boolean
) {
  const inside = (position: number) =>
    position >= 0 && position < visible.length
  let position = from
  if (!inside(position + step)) {
    return position
  }
  if (filled(visible[position]) && filled(visible[position + step])) {
    while (inside(position + step) && filled(visible[position + step])) {
      position += step
    }
    return position
  }
  position += step
  while (inside(position + step) && !filled(visible[position])) {
    position += step
  }
  return position
}
