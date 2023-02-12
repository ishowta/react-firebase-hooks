import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, clearAuth } from '../test/firebase';
import { testLoadableActionHooksCommonCase } from '../test/loadableHooksTest';
import useDeleteUser from './useDeleteUser';

beforeEach(async () => {
  await clearAuth();
  await createUserWithEmailAndPassword(auth, 'test@example.com', 'testtest');
});

testLoadableActionHooksCommonCase(
  'useDeleteUser',
  () => useDeleteUser(auth),
  [],
  (result) => expect(result).toBe(true),
  {
    offlineErrorCode: 'auth/network-request-failed',
  }
);
