import type { ValueOf } from 'type-fest'

export default function deepmerge<T>(
  target: T,
  source: unknown,
  options: {
    clone?: boolean
  } = { clone: true },
): T {
  return options.clone ? useMerge(target, source) : useMerge({}, target, source)
}

export function deepValueDiff<T extends object>(current: T, previous?: Partial<T> | null): T {
  if (!previous) {
    return current
  }
  return useTransform(current, (result: T, value: ValueOf<T>, key: keyof T) => {
    if (Object.prototype.hasOwnProperty.call(previous, key)) {
      if (isObject(value) && isObject(previous[key])) {
        const nestedDiff = deepValueDiff(value, previous[key] as object)
        if (Object.keys(nestedDiff).length > 0) {
          result[key] = nestedDiff as ValueOf<T>
        }
      }
      else if (!isEqual(value, previous[key])) {
        result[key] = value
      }
    }
  })
}
