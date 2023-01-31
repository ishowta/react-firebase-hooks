import { useEffect, useRef } from 'react';

const usePrevious = <T>(currentValue: T): T | undefined => {
  const previousRef = useRef<T | undefined>(undefined);

  useEffect(() => {
    previousRef.current = currentValue;
  });

  return previousRef.current;
};

export const useChanged = (deps: unknown[] | undefined): boolean => {
  const previousDeps = usePrevious(deps);
  const isDepsChanged =
    (previousDeps == null && deps != null) ||
    (previousDeps != null && deps == null) ||
    (previousDeps != null &&
      deps != null &&
      deps.some((dep, i) => dep !== previousDeps[i]));

  return isDepsChanged;
};
