import { functions } from '../test/firebase';
import { testLoadableActionHooksCommonCase } from '../test/loadableHooksTest';
import useHttpsCallable from './useHttpsCallable';

testLoadableActionHooksCommonCase(
  'useHttpsCallable',
  () => useHttpsCallable(functions, 'echo'),
  ['hello'],
  (result) => expect(result?.data).toBe('hello'),
  {
    offlineErrorCode: 'functions/internal',
  }
);
