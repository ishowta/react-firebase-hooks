import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, clearAuth } from '../test/firebase';
import { testLoadableActionHooksCommonCase } from '../test/loadableHooksTest';
import useSignInWithEmailAndPassword from './useSignInWithEmailAndPassword';

beforeEach(async () => {
  await clearAuth();
  await createUserWithEmailAndPassword(auth, 'test@example.com', 'testtest');
});

testLoadableActionHooksCommonCase(
  'useSignInWithEmailAndPassword',
  () => {
    const res = useSignInWithEmailAndPassword(auth);
    return [res[0], res[2], res[3]];
  },
  ['test@example.com', 'testtest'],
  (result) => expect(result?.user.email).toBe('test@example.com'),
  {
    offlineErrorCode: 'auth/network-request-failed',
  }
);
