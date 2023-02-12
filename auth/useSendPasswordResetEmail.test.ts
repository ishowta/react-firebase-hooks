import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, clearAuth } from '../test/firebase';
import { testLoadableActionHooksCommonCase } from '../test/loadableHooksTest';
import useSendPasswordResetEmail from './useSendPasswordResetEmail';

beforeEach(async () => {
  await clearAuth();
  await createUserWithEmailAndPassword(auth, 'test@example.com', 'testtest');
});

testLoadableActionHooksCommonCase(
  'useSendPasswordResetEmail',
  () => useSendPasswordResetEmail(auth),
  [
    'test@example.com',
    {
      url: 'https://example.com',
      handleCodeInApp: true,
    },
  ],
  (result) => expect(result).toBe(true),
  {
    offlineErrorCode: 'auth/network-request-failed',
  }
);
