import * as React from "react"

type Handler = (...args: never[]) => unknown

/**
 * One object whose methods keep the same identity for the component's life
 * but always call the latest render's closures. Hand it to memoized children
 * so they never re-render just because a handler was re-created.
 *
 * The set of method names is read once, on the first render.
 * Call the methods from events and effects, not while rendering.
 */
export function useStableHandlers<T extends Record<string, Handler>>(
  handlers: T
): T {
  const ref = React.useRef(handlers)
  React.useLayoutEffect(() => {
    ref.current = handlers
  })
  const [stable] = React.useState(() => {
    const proxy = {} as Record<string, Handler>
    for (const key of Object.keys(handlers)) {
      proxy[key] = (...args: never[]) => ref.current[key](...args)
    }
    return proxy as T
  })
  return stable
}
