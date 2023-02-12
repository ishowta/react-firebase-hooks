import { FirebaseError } from '@firebase/app';
import { act, renderHook } from '@testing-library/react-hooks';
import Mitm from 'mitm';

export const testLoadableValueHooksCommonCase = <Value>(
  name: string,
  fn: () => [Value, boolean, Error | undefined],
  check: (result: Value) => void | Promise<void>,
  errorTest:
    | {
        offlineErrorCode: string;
      }
    | undefined,
  options?: {
    defaultValue: Value;
    customAction?: () => Promise<unknown>;
  }
) => {
  test(`begins with ${
    options?.defaultValue !== undefined ? 'not loading' : 'loading'
  } in ${name}`, async () => {
    console.log('begin');
    const { result, unmount } = renderHook(() => {
      const [value, loading, error] = fn();
      return { value, loading, error };
    });

    expect(result.current.error).toBe(undefined);
    expect(result.current.loading).toBe(options?.defaultValue === undefined);
    expect(result.current.value).toBe(options?.defaultValue);

    unmount();
    console.log('end');
  });

  // test(`get result in ${name}`, async () => {
  //   console.log('21');
  //   const { result, unmount, waitFor } = renderHook(() => {
  //     const [value, loading, error] = fn();
  //     return { value, loading, error };
  //   });

  //   if (options?.customAction) {
  //     const customAction = options.customAction;
  //     await act(async () => {
  //       await customAction();
  //     });
  //   }

  //   await act(async () => {
  //     await waitFor(() => result.current.loading === false);
  //   });

  //   expect(result.current.error).toBe(undefined);
  //   expect(result.current.loading).toBe(false);
  //   check(result.current.value);

  //   unmount();
  //   console.log('22');
  // });

  if (errorTest) {
    test('errors in action with wrong input', async () => {
      // simulate offline for test error response
      const mitm = Mitm();
      mitm.on('request', (_, res) => {
        res.statusCode = 500;
        res.end();
      });

      const { result, unmount, waitFor } = renderHook(() => {
        const [value, loading, error] = fn();
        return { value, loading, error };
      });

      await act(async () => {
        await waitFor(() => result.current.loading === false);
      });

      expect((result.current.error as FirebaseError)?.code).toBe(
        errorTest.offlineErrorCode
      );
      expect(result.current.loading).toBe(false);
      expect(result.current.value).toBe(undefined);

      mitm.disable();

      unmount();
    });
  }
};

export const testLoadableActionHooksCommonCase = <
  Action extends (...args: any) => any
>(
  name: string,
  fn: () => [Action, boolean, Error | undefined],
  input: Parameters<Action>,
  check: (result: Awaited<ReturnType<Action>>) => void | Promise<void>,
  errorTest:
    | {
        offlineErrorCode: string;
      }
    | undefined
) => {
  test(`begins with function and no loading in ${name}`, async () => {
    const { result, unmount } = renderHook(() => {
      const [action, loading, error] = fn();
      return { action, loading, error };
    });

    expect(result.current.error).toBe(undefined);
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.action).toBe('function');

    unmount();
  });

  test(`call action and get return in ${name}`, async () => {
    const { result, unmount, waitFor } = renderHook(() => {
      const [action, loading, error] = fn();
      return { action, loading, error };
    });

    let actionResult;
    await act(async () => {
      actionResult = await result.current.action(...input);
    });

    await waitFor(() => result.current.loading === false);

    expect(result.current.error).toBe(undefined);
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.action).toBe('function');
    check(actionResult);

    unmount();
  });

  test(`start loading after action in ${name}`, async () => {
    const { result, unmount, waitFor } = renderHook(() => {
      const [action, loading, error] = fn();
      return { action, loading, error };
    });

    let actionResultPromise;
    act(() => {
      actionResultPromise = result.current.action(...input);
    });

    expect(result.current.error).toBe(undefined);
    expect(result.current.loading).toBe(true);
    expect(typeof result.current.action).toBe('function');

    await act(async () => {
      await actionResultPromise;
    });

    await waitFor(() => result.current.loading === false);

    unmount();
  });

  if (errorTest) {
    test('errors in action with wrong input', async () => {
      // simulate offline for test error response
      const mitm = Mitm();
      mitm.on('request', (_, res) => {
        res.statusCode = 500;
        res.end();
      });

      const { result, unmount, waitFor } = renderHook(() => {
        const [action, loading, error] = fn();
        return { action, loading, error };
      });

      await act(async () => {
        await result.current.action(...input);
      });

      await waitFor(() => result.current.loading === false);

      expect((result.current.error as FirebaseError)?.code).toBe(
        errorTest.offlineErrorCode
      );
      expect(result.current.loading).toBe(false);
      expect(typeof result.current.action).toBe('function');

      mitm.disable();

      unmount();
    });
  }
};
