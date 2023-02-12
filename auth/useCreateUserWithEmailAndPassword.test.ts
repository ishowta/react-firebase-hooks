import { auth, clearAuth } from '../test/firebase';
import { testLoadableActionHooksCommonCase } from '../test/loadableHooksTest';
import useCreateUserWithEmailAndPassword from './useCreateUserWithEmailAndPassword';

beforeEach(async () => {
  await clearAuth();
});

testLoadableActionHooksCommonCase(
  'useCreateUserWithEmailAndPassword',
  () => {
    const res = useCreateUserWithEmailAndPassword(auth);
    return [res[0], res[2], res[3]];
  },
  ['test@example.com', 'testtest'],
  (result) => expect(result?.user.email).toBe('test@example.com'),
  {
    offlineErrorCode: 'auth/network-request-failed',
  }
);
