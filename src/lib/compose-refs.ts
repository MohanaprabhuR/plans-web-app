/* eslint-disable react-hooks/refs */
import * as React from "react";

type Ref<T> = React.Ref<T> | undefined;

function setRef<T>(ref: Ref<T>, value: T | null): void {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref != null) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

/**
 * Composes multiple refs (e.g. forwardRef + callback ref) into a single ref callback.
 */
export function useComposedRefs<T>(
  ...refs: Ref<T>[]
): (node: T | null) => void {
  const refsRef = React.useRef(refs);
  refsRef.current = refs;
  return React.useCallback((node: T | null) => {
    for (const ref of refsRef.current) {
      setRef(ref, node);
    }
  }, []);
}
