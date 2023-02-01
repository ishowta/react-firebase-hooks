import { act, renderHook } from '@testing-library/react-hooks';
import { ref, StorageReference, uploadBytesResumable } from 'firebase/storage';
import { storage, testEnv } from '../test/firebase';
import useDownloadURL from './useDownloadURL';
import { readFile } from 'fs/promises';
import { useState } from 'react';

describe('useDownloadURL hook', () => {
  let sampleFileRef: StorageReference;
  let sampleFileText: string;
  let sample2FileRef: StorageReference;
  let sample2FileText: string;
  let privateFileRef: StorageReference;
  let doesNotExistFileRef: StorageReference;
  beforeAll(async () => {
    await testEnv.clearStorage();

    sampleFileRef = ref(storage, 'sample.txt');
    sampleFileText = '🍣';
    const sampleTextBuffer = await readFile('test/resources/sample.txt');
    await uploadBytesResumable(sampleFileRef, sampleTextBuffer);

    sample2FileRef = ref(storage, 'sample2.txt');
    sample2FileText = '☔';
    const sample2TextBuffer = await readFile('test/resources/sample2.txt');
    await uploadBytesResumable(sample2FileRef, sample2TextBuffer);

    privateFileRef = ref(storage, 'private.txt');

    doesNotExistFileRef = ref(storage, 'doesNotExist.txt');
  });

  beforeEach(() => {});

  test('begins in loading state', async () => {
    const { result, unmount, waitFor } = renderHook(() => {
      const [value, loading, error] = useDownloadURL(sampleFileRef);
      return { value, loading, error };
    });

    expect(result.current.error).toBe(undefined);
    expect(result.current.loading).toBe(true);
    expect(result.current.value).toBe(undefined);

    await waitFor(() => result.current.loading === false);

    unmount();
  });

  test('loads and returns url', async () => {
    const { result, unmount, waitFor } = renderHook(() => {
      const [value, loading, error] = useDownloadURL(sampleFileRef);
      return { value, loading, error };
    });

    await waitFor(() => result.current.loading === false);

    expect(result.current.error).toBe(undefined);
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.value).toBe('string');

    const resultFileText = await (await fetch(result.current.value!)).text();
    expect(resultFileText).toBe(sampleFileText);

    unmount();
  });

  test('reset url and start loading after ref is changed', async () => {
    const { result, unmount, waitFor } = renderHook(() => {
      const [ref, setRef] = useState(sampleFileRef);
      const [value, loading, error] = useDownloadURL(ref);
      return { value, loading, error, ref, setRef };
    });

    await waitFor(() => result.current.loading === false);

    expect(result.current.loading).toBe(false);
    expect(typeof result.current.value).toBe('string');

    act(() => {
      result.current.setRef(sample2FileRef);
    });

    expect(result.current.error).toBe(undefined);
    expect(result.current.loading).toBe(true);
    expect(result.current.value).toBe(undefined);

    await waitFor(() => result.current.loading === false);

    unmount();
  });

  test('reset error and start loading after ref is changed', async () => {
    const { result, unmount, waitFor } = renderHook(() => {
      const [ref, setRef] = useState(privateFileRef);
      const [value, loading, error] = useDownloadURL(ref);
      return { value, loading, error, ref, setRef };
    });

    await waitFor(() => result.current.loading === false);

    expect(result.current.error).not.toBe(undefined);
    expect(result.current.loading).toBe(false);

    act(() => {
      result.current.setRef(sampleFileRef);
    });

    expect(result.current.error).toBe(undefined);
    expect(result.current.loading).toBe(true);
    expect(result.current.value).toBe(undefined);

    await waitFor(() => result.current.loading === false);

    unmount();
  });

  test('loads and returns data after ref is changed', async () => {
    const { result, unmount, waitFor } = renderHook(() => {
      const [ref, setRef] = useState(sampleFileRef);
      const [value, loading, error] = useDownloadURL(ref);
      return { value, loading, error, ref, setRef };
    });

    await waitFor(() => result.current.loading === false);

    expect(result.current.loading).toBe(false);

    act(() => {
      result.current.setRef(sample2FileRef);
    });

    await waitFor(() => result.current.loading === false);

    expect(result.current.error).toBe(undefined);
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.value).toBe('string');

    const resultFileText = await (await fetch(result.current.value!)).text();
    expect(resultFileText).toBe(sample2FileText);

    unmount();
  });

  test('error when download unpermitted', async () => {
    const { result, unmount, waitFor } = renderHook(() => {
      const [value, loading, error] = useDownloadURL(privateFileRef);
      return { value, loading, error };
    });

    await waitFor(() => result.current.loading === false);

    expect(result.current.error?.code).toBe('storage/unauthorized');
    expect(result.current.loading).toBe(false);
    expect(result.current.value).toBe(undefined);

    unmount();
  });

  test('error when download does not exist file', async () => {
    const { result, unmount, waitFor } = renderHook(() => {
      const [value, loading, error] = useDownloadURL(doesNotExistFileRef);
      return { value, loading, error };
    });

    await waitFor(() => result.current.loading === false);

    expect(result.current.error?.code).toBe('storage/object-not-found');
    expect(result.current.loading).toBe(false);
    expect(result.current.value).toBe(undefined);

    unmount();
  });
});
