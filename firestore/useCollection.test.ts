import { addDoc, collection, doc, setDoc } from 'firebase/firestore';

import { db } from '../test/firebase';
import { act, renderHook } from '@testing-library/react-hooks';
import { useCollectionData } from './useCollection';
import { useState } from 'react';

describe('useCollectionData hook', () => {
  test('begins in loading state', async () => {
    // arrange
    const collectionID = Math.random().toString();
    await addDoc(collection(db, collectionID), {});

    // act
    const { result, unmount } = renderHook(() => {
      const [collectionData, loading, error] = useCollectionData(
        collection(db, collectionID)
      );
      return { collectionData, loading, error };
    });

    //assert
    expect(result.current.collectionData).toBe(undefined);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(undefined);

    // clean up
    unmount();
  });

  test('loads and returns data from server', async () => {
    // arrange
    const collectionID = Math.random().toString();
    await addDoc(collection(db, collectionID), { name: 'bo' });

    // act
    const { result, waitFor, unmount } = renderHook(() => {
      const [collectionData, loading, error] = useCollectionData(
        collection(db, collectionID)
      );
      return { collectionData, loading, error };
    });
    await waitFor(() => result.current.loading === false);

    // assert
    expect(result.current.collectionData?.[0]).toEqual({ name: 'bo' });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(undefined);

    // clean up
    unmount();
  });

  test('unupdated document instance is same as before', async () => {
    // arrange
    const collectionID = Math.random().toString();
    const documentRef1 = await addDoc(collection(db, collectionID), { a: '1' });
    const documentRef2 = doc(collection(db, collectionID));

    // act
    const { result, unmount, waitFor } = renderHook(() => {
      const [collectionData, loading, error] = useCollectionData(
        collection(db, collectionID)
      );
      return {
        collectionData,
        loading,
        error,
      };
    });

    await waitFor(() => result.current.loading === false);

    const firstFetchedDocument1 = result.current.collectionData?.[0];

    await act(async () => {
      await setDoc(documentRef2, { b: '2' });

      await waitFor(() => result.current.collectionData?.length === 2);
    });

    //assert
    expect(firstFetchedDocument1).toEqual({ a: '1' });
    expect(result.current.collectionData?.[0]).toBe(firstFetchedDocument1);
    expect(result.current.collectionData?.[1]).toEqual({ b: '2' });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(undefined);

    // clean up
    unmount();
  });

  test('start loading after collectionReference is changed', async () => {
    // arrange
    const collectionID1 = Math.random().toString();
    const collectionID2 = Math.random().toString();
    await addDoc(collection(db, collectionID1), { a: '1' });
    await addDoc(collection(db, collectionID2), { b: '2' });

    // act
    const { result, unmount, waitFor } = renderHook(() => {
      const [id, setID] = useState(collectionID1);
      const [collectionData, loading, error] = useCollectionData(
        collection(db, id)
      );
      return {
        id,
        collectionData,
        loading,
        error,
        setID,
      };
    });
    await waitFor(() => result.current.loading === false);

    act(() => {
      result.current.setID(collectionID2);
    });

    //assert
    expect(result.current.collectionData).toBe(undefined);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(undefined);

    // clean up
    unmount();
  });

  test('loads and returns data from server after collectionReference is changed', async () => {
    // arrange
    const collectionID1 = Math.random().toString();
    const collectionID2 = Math.random().toString();
    await addDoc(collection(db, collectionID1), { a: '1' });
    await addDoc(collection(db, collectionID2), { b: '2' });

    // act
    const { result, unmount, waitFor } = renderHook(() => {
      const [id, setID] = useState(collectionID1);
      const [collectionData, loading, error] = useCollectionData(
        collection(db, id)
      );
      return {
        id,
        collectionData,
        loading,
        error,
        setID,
      };
    });

    await waitFor(() => result.current.loading === false);

    act(() => result.current.setID(collectionID2));

    await waitFor(() => result.current.loading === false);

    //assert
    expect(result.current.collectionData?.[0]).toEqual({ b: '2' });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(undefined);

    // clean up
    unmount();
  });

  test('consistency between params and result data', async () => {
    // arrange
    const collectionID1 = Math.random().toString();
    const collectionID2 = Math.random().toString();
    await addDoc(collection(db, collectionID1), { a: '1' });
    await addDoc(collection(db, collectionID2), { b: '2' });

    // act
    const { result, unmount, waitFor } = renderHook(() => {
      const [id, setID] = useState(collectionID1);
      const [collectionData, loading, error] = useCollectionData(
        collection(db, id)
      );
      return {
        id,
        collectionData,
        loading,
        error,
        setID,
      };
    });

    await waitFor(() => result.current.loading === false);

    act(() => {
      result.current.setID(collectionID2);
    });

    await waitFor(() => result.current.loading === false);

    //assert
    result.all.forEach((_eachResult) => {
      const eachResult = _eachResult as typeof result.current;
      expect([
        { id: collectionID1, data: undefined },
        { id: collectionID1, data: { a: '1' } },
        { id: collectionID2, data: undefined },
        { id: collectionID2, data: { b: '2' } },
      ]).toContainEqual({
        id: eachResult.id,
        data: eachResult.collectionData?.[0],
      });
    });

    // clean up
    unmount();
  });
});
