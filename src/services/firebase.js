import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDNwmpcj1enlifJ53BagCCS63nUxPpY_ts",
    authDomain: "obrapm-e883e.firebaseapp.com",
    projectId: "obrapm-e883e",
    storageBucket: "obrapm-e883e.firebasestorage.app",
    messagingSenderId: "931249924677",
    appId: "1:931249924677:web:1cdc1a5b9350882eacd12c"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app; 