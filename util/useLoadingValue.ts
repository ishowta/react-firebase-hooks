import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useChanged } from './useChanged';

export type LoadingValue<T, E> = {
  error?: E;
  loading: boolean;
  setError: (error: E) => void;
  setValue: (value?: T | ((previousValue?: T) => T)) => void;
  value?: T;
};

type ReducerState<E> = {
  error?: E;
  loading: boolean;
  value?: any;
};

type ErrorAction<E> = { type: 'error'; error: E };
type ResetAction = { type: 'reset'; defaultValue?: any };
type ValueAction = { type: 'value'; value: any };
type ReducerAction<E> = ErrorAction<E> | ResetAction | ValueAction;

const defaultState = (defaultValue?: any) => {
  return {
    loading: defaultValue === undefined,
    value: defaultValue,
    error: undefined,
  };
};

const reducer = <E>() => (
  state: ReducerState<E>,
  action: ReducerAction<E>
): ReducerState<E> => {
  switch (action.type) {
    case 'error':
      return {
        ...state,
        error: action.error,
        loading: false,
        value: undefined,
      };
    case 'reset':
      return defaultState(action.defaultValue);
    case 'value':
      return {
        ...state,
        error: undefined,
        loading: false,
        value:
          typeof action.value === 'function'
            ? action.value(state.value)
            : action.value,
      };
    default:
      return state;
  }
};

export default <T, E>(
  getDefaultValue?: () => T,
  deps: unknown[] = []
): LoadingValue<T, E> => {
  const defaultValue = getDefaultValue ? getDefaultValue() : undefined;
  const [stateInternal, dispatch] = useReducer(
    reducer<E>(),
    defaultState(defaultValue)
  );

  const reset = useCallback(() => {
    const defaultValue = getDefaultValue ? getDefaultValue() : undefined;
    dispatch({ type: 'reset', defaultValue });
  }, [getDefaultValue]);

  const setError = useCallback((error: E) => {
    dispatch({ type: 'error', error });
  }, []);

  const setValue = useCallback((value?: T | ((previousValue?: T) => T)) => {
    dispatch({ type: 'value', value });
  }, []);

  const isInitialize = useRef(true);
  useEffect(() => {
    if (isInitialize.current) {
      isInitialize.current = false;
    } else {
      reset();
    }
  }, deps);

  // Reflect the value immediately when deps changed
  const isDepsChanged = useChanged(deps);
  const state = isDepsChanged ? defaultState(defaultValue) : stateInternal;

  return useMemo(
    () => ({
      error: state.error,
      loading: state.loading,
      setError,
      setValue,
      value: state.value,
    }),
    [state.error, state.loading, setError, setValue, state.value]
  );
};
