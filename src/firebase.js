import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import firebase_config from './config.secure'

// Firebase project configuration
const firebaseConfig = {
    apiKey: firebase_config.apiKey,
    authDomain: firebase_config.authDomain,
    projectId: firebase_config.projectId,
    storageBucket: firebase_config.storageBucket,
    messagingSenderId: firebase_config.messagingSenderId,
    appId: firebase_config.appId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set persistence to LOCAL to ensure auth state persists across page refreshes
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✅ Firebase auth persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('Error setting Firebase auth persistence:', error);
  });

export { auth };
export default app;