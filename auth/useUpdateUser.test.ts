import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, clearAuth } from '../test/firebase';
import { testLoadableActionHooksCommonCase } from '../test/loadableHooksTest';
import {
  useUpdateEmail,
  useUpdatePassword,
  useUpdateProfile,
} from './useUpdateUser';

beforeEach(async () => {
  await clearAuth();
  await createUserWithEmailAndPassword(auth, 'test@example.com', 'testtest');
});

testLoadableActionHooksCommonCase(
  'useUpdateEmail',
  () => useUpdateEmail(auth),
  ['test2@example.com'],
  (res) => expect(res).toBe(true),
  {
    offlineErrorCode: 'auth/network-request-failed',
  }
);

testLoadableActionHooksCommonCase(
  'useUpdatePassword',
  () => useUpdatePassword(auth),
  ['foobar'],
  (res) => expect(res).toBe(true),
  {
    offlineErrorCode: 'auth/network-request-failed',
  }
);

testLoadableActionHooksCommonCase(
  'useUpdateProfile',
  () => useUpdateProfile(auth),
  [{ displayName: 'alice' }],
  (res) => expect(res).toBe(true),
  {
    offlineErrorCode: 'auth/network-request-failed',
  }
);
