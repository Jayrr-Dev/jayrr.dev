import * as React from "react"

/**
 * State that a parent may control. Pass `value` to control it; leave it
 * undefined to let the component keep its own state, seeded by `defaultValue`.
 * `onChange` fires on every set, controlled or not, when the value changes.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T
  defaultValue: T
  onChange?: (value: T) => void
}) {
  const [uncontrolled, setUncontrolled] = React.useState<T>(defaultValue)
  const isControlled = value !== undefined
  const current = isControlled ? (value as T) : uncontrolled

  const onChangeRef = React.useRef(onChange)
  React.useEffect(() => {
    onChangeRef.current = onChange
  })

  const setValue = React.useCallback(
    (next: T | ((previous: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (previous: T) => T)(current)
          : next
      if (Object.is(resolved, current)) {
        return
      }
      if (!isControlled) {
        setUncontrolled(resolved)
      }
      onChangeRef.current?.(resolved)
    },
    [current, isControlled]
  )

  return [current, setValue] as const
}
