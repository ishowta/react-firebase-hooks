import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  DocumentSnapshot,
  FirestoreError,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { act, renderHook } from '@testing-library/react-hooks';
import {
  useDocument,
  useDocumentData,
  useDocumentOnce,
  useDocumentDataOnce,
} from './useDocument';
import { useMemo, useState } from 'react';
import { db, env } from '../test/firebase';
import { IDOptions, InitialValueOptions, OnceOptions, Options } from './types';

type UseAnyDocument = <T>(
  ref: DocumentReference<T>
) => [T | undefined, boolean, FirestoreError | undefined];

const eachAnyUseDocument = (() => {
  const useDocumentWrapper: UseAnyDocument = (ref) => {
    const [snapshot, loading, error] = useDocument(ref);
    const data = useMemo(() => {
      if (snapshot) {
        return snapshot.data();
      }
    }, [snapshot]);
    return [data, loading, error];
  };
  const useDocumentOnceWrapper: UseAnyDocument = (ref) => {
    const [snapshot, loading, error] = useDocumentOnce(ref);
    const data = useMemo(() => {
      if (snapshot) {
        return snapshot.data();
      }
    }, [snapshot]);
    return [data, loading, error];
  };
  const useDocumentDataWrapper: UseAnyDocument = (ref) => {
    const [data, loading, error] = useDocumentData(ref);
    return [data, loading, error];
  };
  const useDocumentDataOnceWrapper: UseAnyDocument = (ref) => {
    const [data, loading, error] = useDocumentDataOnce(ref);
    return [data, loading, error];
  };

  return [
    { fnName: 'useDocument', useAnyDocument: useDocumentWrapper },
    {
      fnName: 'useDocumentOnce',
      useAnyDocument: useDocumentOnceWrapper,
    },
    { fnName: 'useDocumentData', useAnyDocument: useDocumentDataWrapper },
    {
      fnName: 'useDocumentDataOnce',
      useAnyDocument: useDocumentDataOnceWrapper,
    },
  ] as const;
})();

type UseAnyNotOnceDocument = <T>(
  ref: DocumentReference<T>,
  options?: Options
) => [T | undefined, boolean, FirestoreError | undefined];

const eachAnyNotOnceUseDocument = (() => {
  const useDocumentWrapper: UseAnyNotOnceDocument = (ref, options) => {
    const [snapshot, loading, error] = useDocument(ref, options);
    const data = useMemo(() => {
      if (snapshot) {
        return snapshot.data();
      }
    }, [snapshot]);
    return [data, loading, error];
  };
  const useDocumentDataWrapper: UseAnyNotOnceDocument = (ref, options) => {
    const [data, loading, error] = useDocumentData(ref, options);
    return [data, loading, error];
  };

  return [
    { fnName: 'useDocument', useAnyNotOnceDocument: useDocumentWrapper },
    {
      fnName: 'useDocumentData',
      useAnyNotOnceDocument: useDocumentDataWrapper,
    },
  ] as const;
})();

type UseAnyOnceDocument = <T>(
  ref: DocumentReference<T>,
  options?: OnceOptions
) => [T | undefined, boolean, FirestoreError | undefined];

const eachAnyOnceUseDocument = (() => {
  const useDocumentOnceWrapper: UseAnyOnceDocument = (ref, options) => {
    const [snapshot, loading, error] = useDocumentOnce(ref, options);
    const data = useMemo(() => {
      if (snapshot) {
        return snapshot.data();
      }
    }, [snapshot]);
    return [data, loading, error];
  };
  const useDocumentDataOnceWrapper: UseAnyOnceDocument = (ref, options) => {
    const [data, loading, error] = useDocumentDataOnce(ref, options);
    return [data, loading, error];
  };

  return [
    {
      fnName: 'useDocumentOnce',
      useAnyOnceDocument: useDocumentOnceWrapper,
    },
    {
      fnName: 'useDocumentDataOnce',
      useAnyOnceDocument: useDocumentDataOnceWrapper,
    },
  ] as const;
})();

type UseAnySnapshotDocument = <T>(
  ref: DocumentReference<T>
) => [DocumentSnapshot<T> | undefined, boolean, FirestoreError | undefined];

const eachAnySnapshotUseDocument = (() => {
  const useDocumentWrapper: UseAnySnapshotDocument = (ref) => {
    const [snapshot, loading, error] = useDocument(ref);
    return [snapshot, loading, error];
  };
  const useDocumentOnceWrapper: UseAnySnapshotDocument = (ref) => {
    const [snapshot, loading, error] = useDocumentOnce(ref);
    return [snapshot, loading, error];
  };

  return [
    { fnName: 'useDocument', useAnySnapshotDocument: useDocumentWrapper },
    {
      fnName: 'useDocumentOnce',
      useAnySnapshotDocument: useDocumentOnceWrapper,
    },
  ] as const;
})();

type UseAnyDataDocument = <T>(
  ref: DocumentReference<T>,
  options?: IDOptions<T> & InitialValueOptions<T>
) => [
  T | undefined,
  boolean,
  FirestoreError | undefined,
  DocumentSnapshot<T> | undefined
];

const eachAnyDataUseDocument = (() => {
  const useDocumentDataWrapper: UseAnyDataDocument = (ref, options) => {
    const [data, loading, error, snapshot] = useDocumentData(ref, options);
    return [data, loading, error, snapshot];
  };
  const useDocumentDataOnceWrapper: UseAnyDataDocument = (ref, options) => {
    const [data, loading, error, snapshot] = useDocumentDataOnce(ref, options);
    return [data, loading, error, snapshot];
  };

  return [
    { fnName: 'useDocumentData', useAnyDataDocument: useDocumentDataWrapper },
    {
      fnName: 'useDocumentDataOnce',
      useAnyDataDocument: useDocumentDataOnceWrapper,
    },
  ] as const;
})();

describe('useDocument hook', () => {
  beforeEach(async () => {
    await env.clearFirestore();
  });

  test.each(eachAnyUseDocument)(
    'begins in loading state on $fnName',
    async ({ useAnyDocument }) => {
      const ref = doc(collection(db, 'test'));

      const { result, unmount } = renderHook(() => {
        const [data, loading, error] = useAnyDocument(ref);
        return { data, loading, error };
      });

      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBe(undefined);

      unmount();
    }
  );

  test.each(eachAnyUseDocument)(
    'loads and returns data on $fnName',
    async ({ useAnyDocument }) => {
      const ref = await addDoc(collection(db, 'test'), { index: 1 });

      const { result, waitFor, unmount } = renderHook(() => {
        const [data, loading, error] = useAnyDocument(ref);
        return { data, loading, error };
      });

      await waitFor(() => result.current.loading === false);

      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual({ index: 1 });

      unmount();
    }
  );

  test.each(eachAnySnapshotUseDocument)(
    'loads and returns not exist on $fnName',
    async ({ useAnySnapshotDocument }) => {
      const ref = doc(collection(db, 'test'));

      const { result, waitFor, unmount } = renderHook(() => {
        const [snapshot, loading, error] = useAnySnapshotDocument(ref);
        return { snapshot, loading, error };
      });

      await waitFor(() => result.current.loading === false);

      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(false);
      expect(result.current.snapshot?.exists()).toBe(false);

      unmount();
    }
  );

  test.each(eachAnyDataUseDocument)(
    'loads and returns undefined on $fnName',
    async ({ useAnyDataDocument }) => {
      const ref = doc(collection(db, 'test'));

      const { result, waitFor, unmount } = renderHook(() => {
        const [data, loading, error] = useAnyDataDocument(ref);
        return { data, loading, error };
      });

      await waitFor(() => result.current.loading === false);

      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(undefined);

      unmount();
    }
  );

  test.each(eachAnyUseDocument)(
    'loads and returns error when permission denied on $fnName',
    async ({ useAnyDocument }) => {
      const ref = doc(collection(db, 'private'), 'foo');

      const { result, waitFor, unmount } = renderHook(() => {
        const [data, loading, error] = useAnyDocument(ref);
        return { data, loading, error };
      });

      await waitFor(() => result.current.loading === false);

      expect(result.current.error?.code).toBe('permission-denied');
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(undefined);

      unmount();
    }
  );

  test.each(eachAnyUseDocument)(
    'reset data and start loading after documentReference is changed on $fnName',
    async ({ useAnyDocument }) => {
      const ref1 = await addDoc(collection(db, 'test'), { index: 1 });
      const ref2 = await addDoc(collection(db, 'test'), { index: 2 });

      const { result, unmount, waitFor } = renderHook(() => {
        const [ref, setRef] = useState(ref1);
        const [data, loading, error] = useAnyDocument(ref);
        return {
          ref,
          data,
          loading,
          error,
          setRef,
        };
      });

      await waitFor(() => result.current.loading === false);

      expect(result.current.loading).toBe(false);
      expect(result.current.data).not.toBe(undefined);

      act(() => {
        result.current.setRef(ref2);
      });

      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBe(undefined);

      unmount();
    }
  );

  test.each(eachAnySnapshotUseDocument)(
    'nothing happens if replaced to same path ref on $fnName',
    async ({ useAnySnapshotDocument }) => {
      const ref1 = await addDoc(collection(db, 'test'), { index: 1 });
      const ref2 = doc(collection(db, 'test'), ref1.id);

      expect(ref1).not.toBe(ref2);

      const { result, unmount, waitFor } = renderHook(() => {
        const [ref, setRef] = useState(ref1);
        const [snapshot, loading, error] = useAnySnapshotDocument(ref);
        return {
          ref,
          snapshot,
          loading,
          error,
          setRef,
        };
      });

      await waitFor(() => result.current.loading === false);

      const prevResult = result.current;

      act(() => {
        result.current.setRef(ref2);
      });

      expect(result.current.error).toBe(prevResult.error);
      expect(result.current.loading).toBe(prevResult.loading);
      expect(result.current.snapshot).toBe(prevResult.snapshot);

      unmount();
    }
  );

  test.each(eachAnyUseDocument)(
    'reset error and start loading after documentReference is changed on $fnName',
    async ({ useAnyDocument }) => {
      const ref1 = doc(collection(db, 'private'), 'foo');
      const ref2 = await addDoc(collection(db, 'test'), { index: 2 });

      const { result, unmount, waitFor } = renderHook(() => {
        const [ref, setRef] = useState(ref1);
        const [data, loading, error] = useAnyDocument(ref);
        return {
          ref,
          data,
          loading,
          error,
          setRef,
        };
      });

      await waitFor(() => result.current.loading === false);

      expect(result.current.error).not.toBe(undefined);
      expect(result.current.loading).toBe(false);

      act(() => {
        result.current.setRef(ref2);
      });

      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBe(undefined);

      unmount();
    }
  );

  test.each(eachAnyUseDocument)(
    'loads and returns data after documentReference is changed on $fnName',
    async ({ useAnyDocument }) => {
      const ref1 = await addDoc(collection(db, 'test'), { index: 1 });
      const ref2 = await addDoc(collection(db, 'test'), { index: 2 });

      const { result, unmount, waitFor } = renderHook(() => {
        const [ref, setRef] = useState(ref1);
        const [data, loading, error] = useAnyDocument(ref);
        return {
          ref,
          data,
          loading,
          error,
          setRef,
        };
      });

      await waitFor(() => result.current.loading === false);

      act(() => result.current.setRef(ref2));

      await waitFor(() => result.current.loading === false);

      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual({ index: 2 });

      unmount();
    }
  );

  test.each(eachAnyNotOnceUseDocument)(
    'create document after useDocument initialized on $fnName',
    async ({ useAnyNotOnceDocument }) => {
      const ref = doc(collection(db, 'test'));

      const { result, unmount, waitFor } = renderHook(() => {
        const [data, loading, error] = useAnyNotOnceDocument(ref);
        return {
          data,
          loading,
          error,
        };
      });

      await waitFor(() => result.current.loading === false);

      expect(result.current.data).toBe(undefined);

      const prevData = result.current.data;

      await act(async () => {
        await setDoc(ref, { index: 1 });
      });

      await waitFor(() => result.current.data !== prevData);

      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual({ index: 1 });

      unmount();
    }
  );

  test.each(eachAnyNotOnceUseDocument)(
    'update document after useDocument initialized on $fnName',
    async ({ useAnyNotOnceDocument }) => {
      const ref = await addDoc(collection(db, 'test'), { index: 1 });

      const { result, unmount, waitFor } = renderHook(() => {
        const [data, loading, error] = useAnyNotOnceDocument(ref);
        return {
          data,
          loading,
          error,
        };
      });

      await waitFor(() => result.current.loading === false);

      expect(result.current.data).toEqual({ index: 1 });

      const prevData = result.current.data;

      await act(async () => {
        await updateDoc(ref, { index: 2 });
      });

      await waitFor(() => result.current.data !== prevData);

      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual({ index: 2 });

      unmount();
    }
  );

  test.each(eachAnyNotOnceUseDocument)(
    'delete document after useDocument initialized on $fnName',
    async ({ useAnyNotOnceDocument }) => {
      const ref = await addDoc(collection(db, 'test'), { index: 1 });

      const { result, unmount, waitFor } = renderHook(() => {
        const [data, loading, error] = useAnyNotOnceDocument(ref);
        return {
          data,
          loading,
          error,
        };
      });

      await waitFor(() => result.current.loading === false);

      expect(result.current.data).toEqual({ index: 1 });

      const prevData = result.current.data;

      await act(async () => {
        await deleteDoc(ref);
      });

      await waitFor(() => result.current.data !== prevData);

      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(undefined);

      unmount();
    }
  );

  test.each(eachAnyNotOnceUseDocument)(
    'reset data and return error after server data was changed to unpermitted on $fnName',
    async ({ useAnyNotOnceDocument }) => {
      const ref = await addDoc(collection(db, 'test_conditionally_private'), {
        index: 1,
      });

      const { result, unmount, waitFor } = renderHook(() => {
        const [data, loading, error] = useAnyNotOnceDocument(ref);
        return {
          data,
          loading,
          error,
        };
      });

      await waitFor(() => result.current.loading === false);

      await act(async () => {
        await updateDoc(ref, { isPrivate: true });
      });

      await waitFor(() => result.current.error != null);

      expect(result.current.error?.code).toBe('permission-denied');
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(undefined);

      unmount();
    }
  );

  test.each(eachAnyUseDocument)(
    'consistency between params and result data on $fnName',
    async ({ useAnyDocument }) => {
      const ref1 = await addDoc(collection(db, 'test'), { index: 1 });
      const ref2 = await addDoc(collection(db, 'test'), { index: 2 });

      const { result, unmount, waitFor } = renderHook(() => {
        const [ref, setRef] = useState(ref1);
        const [data, loading, error] = useAnyDocument(ref);
        return {
          id: ref.id,
          ref,
          data,
          loading,
          error,
          setRef,
        };
      });

      await waitFor(() => result.current.loading === false);

      act(() => {
        result.current.setRef(ref2);
      });

      await waitFor(() => result.current.loading === false);

      result.all.forEach((eachResult) => {
        if (eachResult instanceof Error) {
          fail(eachResult);
        }
        expect([
          { id: ref1.id, data: undefined }, // loading
          { id: ref1.id, data: { index: 1 } }, // loaded
          { id: ref2.id, data: undefined },
          { id: ref2.id, data: { index: 2 } },
        ]).toContainEqual({
          id: eachResult.id,
          data: eachResult.data,
        });
      });

      unmount();
    }
  );

  test('receive metadata change event if db persistence enabled', async () => {
    const user = env.unauthenticatedContext();
    const db = user.firestore();
    await db.enablePersistence();

    const ref = await addDoc(collection(db, 'test'), { index: 1 });

    const { result, waitFor, unmount } = renderHook(() => {
      const [snapshot, loading, error] = useDocument(ref, {
        snapshotListenOptions: {
          includeMetadataChanges: true,
        },
      });
      return { snapshot, loading, error };
    });

    await waitFor(() => result.current.loading === false);

    expect(result.current.snapshot?.metadata.fromCache).toBe(true);

    const prevSnapshot = result.current.snapshot;

    await waitFor(() => result.current.snapshot !== prevSnapshot);

    expect(result.current.snapshot?.metadata.fromCache).toBe(false);

    unmount();

    // FIXME: jest says asynchronous operations remain
    await db.terminate();
  });

  test('receive new data if db persistence enabled', async () => {
    const user = env.unauthenticatedContext();
    const db = user.firestore();
    await db.enablePersistence();

    const ref = await addDoc(collection(db, 'test'), { index: 1 });

    const { result, waitFor, unmount } = renderHook(() => {
      const [data, loading, error] = useDocumentData(ref, {
        snapshotListenOptions: {
          includeMetadataChanges: true,
        },
      });
      return { data, loading, error };
    });

    await waitFor(() => result.current.loading === false);

    expect(result.current.data).not.toBe(undefined);

    const prevData = result.current.data;

    await waitFor(() => result.current.data !== prevData);

    expect(result.current.data).not.toBe(prevData);

    unmount();

    // FIXME: jest says asynchronous operations remain
    await db.terminate();
  });

  test.each(eachAnyDataUseDocument)(
    'returns initial value and not loading if initialValue provided on $fnName',
    async ({ useAnyDataDocument }) => {
      const ref = doc(collection(db, 'test'));

      const { result, unmount } = renderHook(() => {
        const [data, loading, error] = useAnyDataDocument(ref, {
          initialValue: { index: 1 },
        });
        return { data, loading, error };
      });

      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual({ index: 1 });

      unmount();
    }
  );
});
