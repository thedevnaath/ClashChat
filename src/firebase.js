// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA2c7lO8VHi956b-qekrRkgSQuuGW-BfM8",
  authDomain: "clashchatz.firebaseapp.com",
  projectId: "clashchatz",
  storageBucket: "clashchatz.firebasestorage.app",
  messagingSenderId: "75470322957",
  appId: "1:75470322957:web:89e5e370e17693e3f1c444",
  measurementId: "G-LPSSLW4JSN",
  databaseURL: "https://clashchatz-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth & Database
export const auth = getAuth(app);
export const database = getDatabase(app);

// Google Sign-In provider
export const provider = new GoogleAuthProvider();

export default app;
