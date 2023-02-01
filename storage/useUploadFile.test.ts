import { FirebaseError } from '@firebase/util';
import { act, renderHook } from '@testing-library/react-hooks';
import { ref, UploadResult } from 'firebase/storage';
import { storage, testEnv } from '../test/firebase';
import useUploadFile from './useUploadFile';
import { readFile } from 'fs/promises';
import { createHash } from 'crypto';

describe('useUploadFile hook', () => {
  let sampleTextBuffer: Buffer;
  let sampleTextMD5: string;
  beforeAll(async () => {
    sampleTextBuffer = await readFile('test/resources/sample.txt');
    sampleTextMD5 = createHash('md5').update(sampleTextBuffer).digest('base64');
  });

  beforeEach(async () => {
    await testEnv.clearStorage();
  });

  test('begins in function provided and not loading', async () => {
    const { result, unmount } = renderHook(() => {
      const [uploadFile, uploading, snapshot, error] = useUploadFile();
      return { uploadFile, uploading, snapshot, error };
    });

    expect(result.current.error).toBe(undefined);
    expect(result.current.uploading).toBe(false);
    expect(result.current.snapshot).toBe(undefined);
    expect(typeof result.current.uploadFile).toBe('function');

    unmount();
  });

  test('upload file and get return', async () => {
    const fileRef = ref(storage, 'test.txt');

    const { result, unmount, waitFor } = renderHook(() => {
      const [uploadFile, uploading, snapshot, error] = useUploadFile();
      return { uploadFile, uploading, snapshot, error };
    });

    let uploadResult: UploadResult | undefined;
    await act(async () => {
      uploadResult = await result.current.uploadFile(fileRef, sampleTextBuffer);
    });

    await waitFor(() => result.current.uploading === false);

    expect(result.current.error).toBe(undefined);
    expect(result.current.uploading).toBe(false);
    expect(result.current.snapshot).toBe(undefined);
    expect(typeof result.current.uploadFile).toBe('function');
    expect(uploadResult?.metadata.md5Hash).toBe(sampleTextMD5);

    unmount();
  });

  test('start loading after upload file', async () => {
    const fileRef = ref(storage, 'test.txt');

    const { result, unmount, waitFor } = renderHook(() => {
      const [uploadFile, uploading, snapshot, error] = useUploadFile();
      return { uploadFile, uploading, snapshot, error };
    });

    let uploadResultPromise;
    act(() => {
      uploadResultPromise = result.current.uploadFile(
        fileRef,
        sampleTextBuffer
      );
    });

    expect(result.current.error).toBe(undefined);
    expect(result.current.uploading).toBe(true);
    expect(result.current.snapshot).toBe(undefined);
    expect(typeof result.current.uploadFile).toBe('function');

    await act(async () => {
      await uploadResultPromise;
    });

    await waitFor(() => result.current.uploading === false);

    unmount();
  });

  test('error when upload unpermitted', async () => {
    const fileRef = ref(storage, 'invalid.txt');

    const { result, unmount, waitFor } = renderHook(() => {
      const [uploadFile, uploading, snapshot, error] = useUploadFile();
      return { uploadFile, uploading, snapshot, error };
    });

    let uploadResult: UploadResult | undefined;
    await act(async () => {
      uploadResult = await result.current.uploadFile(fileRef, sampleTextBuffer);
    });

    await waitFor(() => result.current.uploading === false);

    expect(result.current.error?.code).toBe('storage/unauthorized');
    expect(result.current.uploading).toBe(false);
    expect(typeof result.current.uploadFile).toBe('function');
    expect(uploadResult).toBe(undefined);

    unmount();
  });

  test('get snapshot after upload file', async () => {
    const fileRef = ref(storage, 'test.txt');

    const { result, unmount, waitFor } = renderHook(() => {
      const [uploadFile, uploading, snapshot, error] = useUploadFile();
      return { uploadFile, uploading, snapshot, error };
    });

    let uploadResultPromise;
    act(() => {
      uploadResultPromise = result.current.uploadFile(
        fileRef,
        sampleTextBuffer
      );
    });

    await waitFor(() => result.current.snapshot !== undefined);

    expect(result.current.error).toBe(undefined);
    expect(result.current.uploading).toBe(true);
    expect(result.current.snapshot?.state).toBe('running');
    expect(typeof result.current.uploadFile).toBe('function');

    await act(async () => {
      await uploadResultPromise;
    });

    unmount();
  });
});
