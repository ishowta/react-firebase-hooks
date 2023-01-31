import {
  initializeTestEnvironment,
  RulesTestContext,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { Firestore } from 'firebase/firestore';

import 'fake-indexeddb/auto';

export let env: RulesTestEnvironment;
export let user: RulesTestContext;
export let db: Firestore;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-noop',
    firestore: {
      host: '127.0.0.1',
      port: 8080,
    },
  });

  user = await env.unauthenticatedContext();

  // Conversion is safe. see https://github.com/firebase/firebase-js-sdk/issues/5550#issuecomment-928453315
  db = (user.firestore() as unknown) as Firestore;
});

afterAll(async () => {
  env.cleanup();
});
