// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
import { getFirestore } from "firebase/firestore";
import { Platform } from 'react-native';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC5r1fHWFNHW-H0nZ7xFrkOCOsOT-eqqKc",
  authDomain: "threadmarks-4956e.firebaseapp.com",
  projectId: "threadmarks-4956e",
  storageBucket: "threadmarks-4956e.firebasestorage.app",
  messagingSenderId: "262568655870",
  appId: "1:262568655870:web:6bc0e6f1185ba837f6deaf",
  measurementId: "G-TXCCX2ZYLX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, Platform.OS === 'web'
    ? { persistence: browserLocalPersistence }
    : { persistence: getReactNativePersistence(ReactNativeAsyncStorage) }
)

export const db = getFirestore(app);

// Analytics is browser-only; guard so SSR/static rendering doesn't crash.
let analytics;
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  import('firebase/analytics').then(({ getAnalytics, isSupported }) => {
    isSupported().then((ok) => { if (ok) analytics = getAnalytics(app); }).catch(() => {});
  }).catch(() => {});
}
export { analytics };