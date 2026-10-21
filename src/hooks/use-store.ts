"use client";

import { useEffect, useState } from "react";

// Re-reads a value from the local store whenever it changes (any tab / component).
export function useStoreValue<T>(getter: () => T, fallback: T): T {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    const update = () => setValue(getter());
    update();
    window.addEventListener("showup:store", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("showup:store", update);
      window.removeEventListener("storage", update);
    };
    // getter is expected to be a stable module-level function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}
