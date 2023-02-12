import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, clearAuth } from '../test/firebase';
import { testLoadableValueHooksCommonCase } from '../test/loadableHooksTest';
import useIdToken from './useIdToken';

beforeEach(async () => {
  await clearAuth();
});

testLoadableValueHooksCommonCase(
  'useIdToken',
  () => useIdToken(auth),
  (result) => expect(result?.email).toBe('test@example.com'),
  undefined,
  {
    defaultValue: null,
    customAction: () =>
      createUserWithEmailAndPassword(auth, 'test@example.com', 'testtest'),
  }
);
