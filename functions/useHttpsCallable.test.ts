import { FirebaseError } from '@firebase/util';
import { act, renderHook } from '@testing-library/react-hooks';
import { functions } from '../test/firebase';
import useHttpsCallable from './useHttpsCallable';

describe('useHttpsCallable hook', () => {
  beforeEach(() => {});

  test('begins in callable function provided and not loading', async () => {
    const { result, unmount } = renderHook(() => {
      const [testCall, loading, error] = useHttpsCallable(functions, 'ping');
      return { testCall, loading, error };
    });

    expect(result.current.error).toBe(undefined);
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.testCall).toBe('function');

    unmount();
  });

  test('call function and get return', async () => {
    const { result, unmount, waitFor } = renderHook(() => {
      const [testCall, loading, error] = useHttpsCallable(functions, 'ping');
      return { testCall, loading, error };
    });

    let callResult;
    await act(async () => {
      callResult = await result.current.testCall();
    });

    await waitFor(() => result.current.loading === false, { timeout: 10000 });

    expect(result.current.error).toBe(undefined);
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.testCall).toBe('function');
    expect(callResult).toEqual({ data: 'pong' });

    unmount();
  });

  test('call function with params and get result', async () => {
    const { result, unmount, waitFor } = renderHook(() => {
      const [testCall, loading, error] = useHttpsCallable(functions, 'echo');
      return { testCall, loading, error };
    });

    let callResult;
    await act(async () => {
      callResult = await result.current.testCall('hello');
    });

    await waitFor(() => result.current.loading === false, { timeout: 10000 });

    expect(result.current.error).toBe(undefined);
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.testCall).toBe('function');
    expect(callResult).toEqual({ data: 'hello' });

    unmount();
  });

  test('start loading after call function', async () => {
    const { result, unmount, waitFor } = renderHook(() => {
      const [testCall, loading, error] = useHttpsCallable(functions, 'ping');
      return { testCall, loading, error };
    });

    let callResultPromise;
    act(() => {
      callResultPromise = result.current.testCall();
    });

    expect(result.current.error).toBe(undefined);
    expect(result.current.loading).toBe(true);
    expect(typeof result.current.testCall).toBe('function');

    await act(async () => {
      await callResultPromise;
    });

    await waitFor(() => result.current.loading === false, { timeout: 10000 });

    unmount();
  });

  test('errors in function calls are stored', async () => {
    const { result, unmount, waitFor } = renderHook(() => {
      const [testCall, loading, error] = useHttpsCallable(
        functions,
        'doesNotExistFunc'
      );
      return { testCall, loading, error };
    });

    let callResult;
    await act(async () => {
      callResult = await result.current.testCall();
    });

    await waitFor(() => result.current.loading === false, { timeout: 10000 });

    expect((result.current.error as FirebaseError)?.code).toBe(
      'functions/not-found'
    );
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.testCall).toBe('function');
    expect(callResult).toBe(undefined);

    unmount();
  });
});
