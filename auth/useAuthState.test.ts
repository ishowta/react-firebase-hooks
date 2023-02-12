import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, clearAuth } from '../test/firebase';
import { testLoadableValueHooksCommonCase } from '../test/loadableHooksTest';
import useAuthState from './useAuthState';

beforeEach(async () => {
  await clearAuth();
});

testLoadableValueHooksCommonCase(
  'useIdToken',
  () => useAuthState(auth),
  (result) => expect(result?.email).toBe('test@example.com'),
  undefined,
  {
    defaultValue: null,
    customAction: () =>
      createUserWithEmailAndPassword(auth, 'test@example.com', 'testtest'),
  }
);
