import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  QuerySnapshot,
  FirestoreError,
  setDoc,
  updateDoc,
  query,
  orderBy,
  Query,
  SnapshotOptions,
  serverTimestamp,
  SnapshotListenOptions,
} from 'firebase/firestore';
import { act, renderHook } from '@testing-library/react-hooks';
import {
  useCollection,
  useCollectionData,
  useCollectionOnce,
  useCollectionDataOnce,
} from './useCollection';
import { useMemo, useState } from 'react';
import { firestore, testEnv } from '../test/firebase';
import { IDOptions, InitialValueOptions, OnceOptions, Options } from './types';

type UseAnyCollection = <T>(
  ref: Query<T>
) => [T[] | undefined, boolean, FirestoreError | undefined];

const eachAnyUseCollection = (() => {
  const useCollectionWrapper: UseAnyCollection = (ref) => {
    const [snapshot, loading, error] = useCollection(ref);
    const data = useMemo(() => {
      if (snapshot) {
        return snapshot.docs.map((doc) => doc.data());
      }
    }, [snapshot]);
    return [data, loading, error];
  };
  const useCollectionOnceWrapper: UseAnyCollection = (ref) => {
    const [snapshot, loading, error] = useCollectionOnce(ref);
    const data = useMemo(() => {
      if (snapshot) {
        return snapshot.docs.map((doc) => doc.data());
      }
    }, [snapshot]);
    return [data, loading, error];
  };
  const useCollectionDataWrapper: UseAnyCollection = (ref) => {
    const [data, loading, error] = useCollectionData(ref);
    return [data, loading, error];
  };
  const useCollectionDataOnceWrapper: UseAnyCollection = (ref) => {
    const [data, loading, error] = useCollectionDataOnce(ref);
    return [data, loading, error];
  };

  return [
    { fnName: 'useCollection', useAnyCollection: useCollectionWrapper },
    {
      fnName: 'useCollectionOnce',
      useAnyCollection: useCollectionOnceWrapper,
    },
    { fnName: 'useCollectionData', useAnyCollection: useCollectionDataWrapper },
    {
      fnName: 'useCollectionDataOnce',
      useAnyCollection: useCollectionDataOnceWrapper,
    },
  ] as const;
})();

type UseAnyNotOnceCollection = <T>(
  ref: Query<T>,
  options?: Options
) => [T[] | undefined, boolean, FirestoreError | undefined];

const eachAnyNotOnceUseCollection = (() => {
  const useCollectionWrapper: UseAnyNotOnceCollection = (ref, options) => {
    const [snapshot, loading, error] = useCollection(ref, options);
    const data = useMemo(() => {
      if (snapshot) {
        return snapshot.docs.map((doc) => doc.data());
      }
    }, [snapshot]);
    return [data, loading, error];
  };
  const useCollectionDataWrapper: UseAnyNotOnceCollection = (ref, options) => {
    const [data, loading, error] = useCollectionData(ref, options);
    return [data, loading, error];
  };

  return [
    { fnName: 'useCollection', useAnyNotOnceCollection: useCollectionWrapper },
    {
      fnName: 'useCollectionData',
      useAnyNotOnceCollection: useCollectionDataWrapper,
    },
  ] as const;
})();

type UseAnyOnceCollection = <T>(
  ref: Query<T>,
  options?: OnceOptions
) => [T[] | undefined, boolean, FirestoreError | undefined];

const eachAnyOnceUseCollection = (() => {
  const useCollectionOnceWrapper: UseAnyOnceCollection = (ref, options) => {
    const [snapshot, loading, error] = useCollectionOnce(ref, options);
    const data = useMemo(() => {
      if (snapshot) {
        return snapshot.docs.map((doc) => doc.data());
      }
    }, [snapshot]);
    return [data, loading, error];
  };
  const useCollectionDataOnceWrapper: UseAnyOnceCollection = (ref, options) => {
    const [data, loading, error] = useCollectionDataOnce(ref, options);
    return [data, loading, error];
  };

  return [
    {
      fnName: 'useCollectionOnce',
      useAnyOnceCollection: useCollectionOnceWrapper,
    },
    {
      fnName: 'useCollectionDataOnce',
      useAnyOnceCollection: useCollectionDataOnceWrapper,
    },
  ] as const;
})();

type UseAnySnapshotCollection = <T>(
  ref: Query<T>
) => [QuerySnapshot<T> | undefined, boolean, FirestoreError | undefined];

const eachAnySnapshotUseCollection = (() => {
  const useCollectionWrapper: UseAnySnapshotCollection = (ref) => {
    const [snapshot, loading, error] = useCollection(ref);
    return [snapshot, loading, error];
  };
  const useCollectionOnceWrapper: UseAnySnapshotCollection = (ref) => {
    const [snapshot, loading, error] = useCollectionOnce(ref);
    return [snapshot, loading, error];
  };

  return [
    { fnName: 'useCollection', useAnySnapshotCollection: useCollectionWrapper },
    {
      fnName: 'useCollectionOnce',
      useAnySnapshotCollection: useCollectionOnceWrapper,
    },
  ] as const;
})();

type UseAnyDataCollection = <T>(
  ref: Query<T>,
  options?: IDOptions<T> & InitialValueOptions<T[]>
) => [
  T[] | undefined,
  boolean,
  FirestoreError | undefined,
  QuerySnapshot<T> | undefined
];

const eachAnyDataUseCollection = (() => {
  const useCollectionDataWrapper: UseAnyDataCollection = (ref, options) => {
    const [data, loading, error, snapshot] = useCollectionData(ref, options);
    return [data, loading, error, snapshot];
  };
  const useCollectionDataOnceWrapper: UseAnyDataCollection = (ref, options) => {
    const [data, loading, error, snapshot] = useCollectionDataOnce(
      ref,
      options
    );
    return [data, loading, error, snapshot];
  };

  return [
    {
      fnName: 'useCollectionData',
      useAnyDataCollection: useCollectionDataWrapper,
    },
    {
      fnName: 'useCollectionDataOnce',
      useAnyDataCollection: useCollectionDataOnceWrapper,
    },
  ] as const;
})();

describe('useCollection hook', () => {
  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  test.each(eachAnyUseCollection)(
    'begins in loading state on $fnName',
    async ({ useAnyCollection }) => {
      const ref = collection(firestore, 'test');

      const { result, unmount, waitFor } = renderHook(() => {
        const [data, loading, error] = useAnyCollection(ref);
        return { data, loading, error };
      });

      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBe(undefined);

      await waitFor(() => result.current.loading === false);

      unmount();
    }
  );

  test.each(eachAnyUseCollection)(
    'loads and returns data on $fnName',
    async ({ useAnyCollection }) => {
      const ref = collection(firestore, 'test');
      await addDoc(ref, { index: 1 });

      const { result, waitFor, unmount } = renderHook(() => {
        const [data, loading, error] = useAnyCollection(ref);
        return { data, loading, error };
      });

      await waitFor(() => result.current.loading === false);

      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual([{ index: 1 }]);

      unmount();
    }
  );

  test.each(eachAnyUseCollection)(
    'loads and returns empty list if no document exists on $fnName',
    async ({ useAnyCollection }) => {
      const ref = collection(firestore, 'test');

      const { result, waitFor, unmount } = renderHook(() => {
        const [data, loading, error] = useAnyCollection(ref);
        return { data, loading, error };
      });

      await waitFor(() => result.current.loading === false);

      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual([]);

      unmount();
    }
  );

  test.each(eachAnyUseCollection)(
    'loads and returns error when permission denied on $fnName',
    async ({ useAnyCollection }) => {
      const ref = collection(firestore, 'private');

      const { result, waitFor, unmount } = renderHook(() => {
        const [data, loading, error] = useAnyCollection(ref);
        return { data, loading, error };
      });

      await waitFor(() => result.current.loading === false);

      expect(result.current.error?.code).toBe('permission-denied');
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(undefined);

      unmount();
    }
  );

  test.each(eachAnyUseCollection)(
    'reset data and start loading after collectionReference is changed on $fnName',
    async ({ useAnyCollection }) => {
      const ref1 = collection(firestore, 'test');
      const ref2 = collection(firestore, 'test2');

      const { result, unmount, waitFor } = renderHook(() => {
        const [ref, setRef] = useState(ref1);
        const [data, loading, error] = useAnyCollection(ref);
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

  test.each(eachAnySnapshotUseCollection)(
    'nothing happens if replaced to same path ref on $fnName',
    async ({ useAnySnapshotCollection }) => {
      const ref1 = collection(firestore, 'test');
      const ref2 = collection(firestore, 'test');

      expect(ref1).not.toBe(ref2);

      const { result, unmount, waitFor } = renderHook(() => {
        const [ref, setRef] = useState(ref1);
        const [snapshot, loading, error] = useAnySnapshotCollection(ref);
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

  test.each(eachAnyUseCollection)(
    'reset error and start loading after collectionReference is changed on $fnName',
    async ({ useAnyCollection }) => {
      const ref1 = collection(firestore, 'private');
      const ref2 = collection(firestore, 'test');

      const { result, unmount, waitFor } = renderHook(() => {
        const [ref, setRef] = useState(ref1);
        const [data, loading, error] = useAnyCollection(ref);
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

  test.each(eachAnyUseCollection)(
    'loads and returns data after collectionReference is changed on $fnName',
    async ({ useAnyCollection }) => {
      const ref1 = collection(firestore, 'test');
      const ref2 = collection(firestore, 'test2');
      await addDoc(ref2, { index: 2 });

      const { result, unmount, waitFor } = renderHook(() => {
        const [ref, setRef] = useState(ref1);
        const [data, loading, error] = useAnyCollection(ref);
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
      expect(result.current.data).toEqual([{ index: 2 }]);

      unmount();
    }
  );

  test.each(eachAnyNotOnceUseCollection)(
    'add document after useCollection initialized on $fnName',
    async ({ useAnyNotOnceCollection }) => {
      const ref = collection(firestore, 'test');
      const docRef = doc(ref);

      const { result, unmount, waitFor } = renderHook(() => {
        const [data, loading, error] = useAnyNotOnceCollection(ref);
        return {
          data,
          loading,
          error,
        };
      });

      await waitFor(() => result.current.loading === false);

      expect(result.current.data).toEqual([]);

      const prevData = result.current.data;

      await act(async () => {
        await setDoc(docRef, { index: 1 });
      });

      await waitFor(() => result.current.data !== prevData);

      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual([
        {
          index: 1,
        },
      ]);

      unmount();
    }
  );

  test.each(eachAnyNotOnceUseCollection)(
    'update document after useCollection initialized on $fnName',
    async ({ useAnyNotOnceCollection }) => {
      const ref = collection(firestore, 'test');
      const docRef = await addDoc(ref, { index: 1 });

      const { result, unmount, waitFor } = renderHook(() => {
        const [data, loading, error] = useAnyNotOnceCollection(ref);
        return {
          data,
          loading,
          error,
        };
      });

      await waitFor(() => result.current.loading === false);

      expect(result.current.data).toEqual([
        {
          index: 1,
        },
      ]);

      const prevData = result.current.data;

      await act(async () => {
        await updateDoc(docRef, { index: 2 });
      });

      await waitFor(() => result.current.data !== prevData);

      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual([
        {
          index: 2,
        },
      ]);

      unmount();
    }
  );

  test.each(eachAnyNotOnceUseCollection)(
    'swap document after useCollection initialized on $fnName',
    async ({ useAnyNotOnceCollection }) => {
      const ref = collection(firestore, 'test');
      const docRef1 = doc(ref);
      const docRef2 = doc(ref);
      await setDoc(docRef1, { index: 1 });
      await setDoc(docRef2, { index: 2 });
      const orderByIndexQuery = query(ref, orderBy('index'));

      const { result, unmount, waitFor } = renderHook(() => {
        const [data, loading, error] = useAnyNotOnceCollection(
          orderByIndexQuery
        );
        return {
          data,
          loading,
          error,
        };
      });

      await waitFor(() => result.current.loading === false);

      expect(result.current.data).toEqual([
        {
          index: 1,
        },
        {
          index: 2,
        },
      ]);

      const prevData = result.current.data;

      await act(async () => {
        await updateDoc(docRef1, { index: 3 });
      });

      await waitFor(() => result.current.data !== prevData);

      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual([
        {
          index: 2,
        },
        {
          index: 3,
        },
      ]);

      unmount();
    }
  );

  test.each(eachAnyNotOnceUseCollection)(
    'delete collection after useCollection initialized on $fnName',
    async ({ useAnyNotOnceCollection }) => {
      const ref = collection(firestore, 'test');
      const docRef = await addDoc(ref, { index: 1 });

      const { result, unmount, waitFor } = renderHook(() => {
        const [data, loading, error] = useAnyNotOnceCollection(ref);
        return {
          data,
          loading,
          error,
        };
      });

      await waitFor(() => result.current.loading === false);

      expect(result.current.data).toEqual([
        {
          index: 1,
        },
      ]);

      const prevData = result.current.data;

      await act(async () => {
        await deleteDoc(docRef);
      });

      await waitFor(() => result.current.data !== prevData);

      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual([]);

      unmount();
    }
  );

  test.each(eachAnyOnceUseCollection)(
    'add document after initialized does not affected to result on $fnName',
    async ({ useAnyOnceCollection }) => {
      const ref = collection(firestore, 'test');
      const docRef = doc(ref);

      const { result, unmount, waitFor } = renderHook(() => {
        const [once_data, once_loading, once_error] = useAnyOnceCollection(ref);
        const [data, loading, error] = useCollectionData(ref);
        return {
          once_data,
          once_loading,
          once_error,
          data,
          loading,
          error,
        };
      });

      await waitFor(
        () =>
          result.current.once_loading === false &&
          result.current.loading === false
      );

      expect(result.current.once_data).toEqual([]);

      const prevData = result.current.once_data;

      await act(async () => {
        await setDoc(docRef, { index: 1 });
      });

      await waitFor(() => result.current.loading === false);

      expect(result.current.data).toEqual([
        {
          index: 1,
        },
      ]);
      expect(result.current.once_error).toBe(undefined);
      expect(result.current.once_loading).toBe(false);
      expect(result.current.once_data).toBe(prevData);

      unmount();
    }
  );

  test.each(eachAnyUseCollection)(
    'consistency between params and result data on $fnName',
    async ({ useAnyCollection }) => {
      const ref1 = collection(firestore, 'test');
      await addDoc(ref1, { index: 1 });
      const ref2 = collection(firestore, 'test2');
      await addDoc(ref2, { index: 2 });

      const { result, unmount, waitFor } = renderHook(() => {
        const [ref, setRef] = useState(ref1);
        const [data, loading, error] = useAnyCollection(ref);
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
          { id: ref1.id, data: [{ index: 1 }] }, // loaded
          { id: ref2.id, data: undefined },
          { id: ref2.id, data: [{ index: 2 }] },
        ]).toContainEqual({
          id: eachResult.id,
          data: eachResult.data,
        });
      });

      unmount();
    }
  );

  test('receive new data if includeMetadataChanges enabled', async () => {
    const ref = collection(firestore, 'test');
    const docRef = doc(ref);

    const snapshotListenOptions = {
      includeMetadataChanges: true,
    };

    const { result, waitFor, unmount } = renderHook(() => {
      const [data, loading, error] = useCollectionData(ref, {
        snapshotListenOptions,
      });
      return { data, loading, error };
    });

    await waitFor(() => result.current.loading === false);

    const setDocPromise = setDoc(docRef, { index: 1 });

    await waitFor(() => result.current.data?.length === 1);

    const prevData = result.current.data;

    await waitFor(() => result.current.data !== prevData);

    expect(result.current.data?.[0]).not.toBe(prevData?.[0]);

    await setDocPromise;

    unmount();
  });

  test('receive metadata change after change snapshotListenOptions', async () => {
    const ref = collection(firestore, 'test');
    const docRef = await addDoc(ref, { index: 1 });

    const { result, waitFor, unmount } = renderHook(() => {
      const [
        snapshotListenOptions,
        setSnapshotListenOptions,
      ] = useState<SnapshotListenOptions>({
        includeMetadataChanges: false,
      });
      const [snapshot, loading, error] = useCollection(ref, {
        snapshotListenOptions,
      });
      return { snapshot, loading, error, setSnapshotListenOptions };
    });

    act(() => {
      result.current.setSnapshotListenOptions({
        includeMetadataChanges: true,
      });
    });

    await waitFor(() => result.current.loading === false);

    await act(async () => {
      await updateDoc(docRef, { index: 2 });
    });

    await waitFor(
      () =>
        result.current.loading === false &&
        result.current.snapshot?.metadata.hasPendingWrites === false
    );

    expect(
      result.all.some(
        (result) =>
          !(result instanceof Error) &&
          result?.snapshot?.metadata?.hasPendingWrites === false
      )
    ).toBe(true);
    expect(
      result.all.some(
        (result) =>
          !(result instanceof Error) &&
          result?.snapshot?.metadata?.hasPendingWrites === true
      )
    ).toBe(true);

    expect(
      result.all.some(
        (result) =>
          !(result instanceof Error) &&
          result?.snapshot?.docs[0]?.metadata?.hasPendingWrites === false
      )
    ).toBe(true);
    expect(
      result.all.some(
        (result) =>
          !(result instanceof Error) &&
          result?.snapshot?.docs[0]?.metadata?.hasPendingWrites === true
      )
    ).toBe(true);

    unmount();
  });

  test.each(eachAnyDataUseCollection)(
    'returns initial value and not loading if initialValue provided on $fnName',
    async ({ useAnyDataCollection }) => {
      const ref = collection(firestore, 'test');

      const { result, unmount, waitFor } = renderHook(() => {
        const [data, loading, error] = useAnyDataCollection(ref, {
          initialValue: [{ index: 1 }],
        });
        return { data, loading, error };
      });

      expect(result.current.error).toBe(undefined);
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual([{ index: 1 }]);

      await waitFor(() => result.current.loading === false);

      unmount();
    }
  );

  test('unupdated document is keep same instance as before on useCollectionData', async () => {
    const ref = collection(firestore, 'test');
    const docRef1 = doc(ref);
    const docRef2 = doc(ref);
    await setDoc(docRef1, { index: 1 });
    const orderByIndexQuery = query(
      collection(firestore, 'test'),
      orderBy('index')
    );

    const { result, unmount, waitFor } = renderHook(() => {
      const [data, loading, error] = useCollectionData(orderByIndexQuery);
      return {
        data,
        loading,
        error,
      };
    });

    await waitFor(() => result.current.loading === false);

    const prevData1 = result.current.data;

    expect(prevData1?.[0]).toEqual({ index: 1 });

    await act(async () => {
      await setDoc(docRef2, { index: 2 });
    });

    await waitFor(() => result.current.data?.length === 2);

    expect(result.current.data?.[0]).toEqual({ index: 1 });
    expect(result.current.data?.[0]).toBe(prevData1?.[0]);

    unmount();
  });

  test('refresh document instance when change options.snapshotOptions', async () => {
    const ref = collection(firestore, 'test');
    await addDoc(ref, { index: 1 });

    const { result, unmount, waitFor } = renderHook(() => {
      const [snapshotOptions, setSnapshotOptions] = useState<SnapshotOptions>({
        serverTimestamps: 'estimate',
      });
      const [data, loading, error] = useCollectionData(ref, {
        snapshotOptions,
      });
      return {
        data,
        loading,
        error,
        setSnapshotOptions,
      };
    });

    await waitFor(() => {
      return result.current.loading === false;
    });

    expect(result.current.data).not.toBe(undefined);

    const prevData = result.current.data;

    act(() => {
      result.current.setSnapshotOptions({ serverTimestamps: 'previous' });
    });

    await waitFor(() => {
      return result.current.data !== prevData;
    });

    expect(result.current.data).not.toBe(undefined);
    expect(result.current.data![0]).not.toBe(prevData![0]);

    unmount();
  });

  test('changed snapshotOptions is attached to new data', async () => {
    const ref = collection(firestore, 'test');
    const docRef = doc(ref);

    const { result, unmount, waitFor } = renderHook(() => {
      const [snapshotOptions, setSnapshotOptions] = useState<SnapshotOptions>({
        serverTimestamps: 'estimate',
      });
      const [data, loading, error] = useCollectionData(ref, {
        snapshotOptions,
      });
      return {
        data,
        loading,
        error,
        setSnapshotOptions,
      };
    });

    await waitFor(() => {
      return result.current.loading === false;
    });

    expect(result.current.data).not.toBe(undefined);

    const prevData = result.current.data;

    act(() => {
      result.current.setSnapshotOptions({ serverTimestamps: 'none' });
    });

    await act(async () => {
      await setDoc(docRef, { time: serverTimestamp() });
    });

    await waitFor(() => {
      return result.current.data !== prevData;
    });

    expect(result.current.data).not.toBe(undefined);
    expect(result.current.data![0].time).toBe(null);

    unmount();
  });
});
