import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoWO_6I-hKlJo3RaqrmKpDynTGK8kJhxw",
  authDomain: "inked-news-2d054.firebaseapp.com",
  projectId: "inked-news-2d054",
  storageBucket: "inked-news-2d054.firebasestorage.app",
  messagingSenderId: "863696557178",
  appId: "1:863696557178:web:9490eb77defd38d52797c3",
  measurementId: "G-QTNW1HNH44",
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with React Native AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

export { app, auth };
