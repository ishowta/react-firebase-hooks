import { usePrevious } from './usePrevious';

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
