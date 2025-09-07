import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCIWw8qZVaCa2ZMoJx33aNQ6plfzBA5-jw",
  authDomain: "cyberbuddy-da99a.firebaseapp.com",
  projectId: "cyberbuddy-da99a",
  storageBucket: "cyberbuddy-da99a.firebasestorage.app",
  messagingSenderId: "519203222156",
  appId: "1:519203222156:web:6cd2dcd8348a238b1cc1a9",
  measurementId: "G-84JB64HDW7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
