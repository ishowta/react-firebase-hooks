import {
  initializeTestEnvironment,
  RulesTestContext,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { Firestore } from 'firebase/firestore';

import 'fake-indexeddb/auto';
import { Database } from 'firebase/database';
import {
  connectFunctionsEmulator,
  Functions,
  getFunctions,
} from 'firebase/functions';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { FirebaseApp, initializeApp } from '@firebase/app';
import { FirebaseStorage } from 'firebase/storage';

export let testEnv: RulesTestEnvironment;
export let testContext: RulesTestContext;
export let testApp: FirebaseApp;
export let firestore: Firestore;
export let db: Database;
export let storage: FirebaseStorage;
export let functions: Functions;
export let auth: Auth;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-noop',
    firestore: {
      host: '127.0.0.1',
      port: 8080,
    },
    database: {
      host: '127.0.0.1',
      port: 8082,
    },
    storage: {
      host: '127.0.0.1',
      port: 8084,
    },
  });

  testContext = await testEnv.unauthenticatedContext();

  testApp = initializeApp({
    projectId: 'demo-noop',
    apiKey: 'test',
  });

  // Conversion is safe. see https://github.com/firebase/firebase-js-sdk/issues/5550#issuecomment-928453315
  firestore = (testContext.firestore() as unknown) as Firestore;
  db = (testContext.database() as unknown) as Database;
  storage = (testContext.storage() as unknown) as FirebaseStorage;

  functions = getFunctions(testApp);
  connectFunctionsEmulator(functions, '127.0.0.1', 8083);
  auth = getAuth(testApp);
  connectAuthEmulator(auth, 'http://127.0.0.1:8081');
});

afterAll(async () => {
  testEnv.cleanup();
});
