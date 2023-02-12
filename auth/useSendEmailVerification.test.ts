import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, clearAuth } from '../test/firebase';
import { testLoadableActionHooksCommonCase } from '../test/loadableHooksTest';
import useSendEmailVerification from './useSendEmailVerification';

beforeEach(async () => {
  await clearAuth();
  await createUserWithEmailAndPassword(auth, 'test@example.com', 'testtest');
});

testLoadableActionHooksCommonCase(
  'useSendEmailVerification',
  () => useSendEmailVerification(auth),
  [],
  (result) => expect(result).toBe(true),
  {
    offlineErrorCode: 'auth/network-request-failed',
  }
);
