// src/firebase.js
// Firebase configuration for ClashChat⚡

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2c7lO8VHi956b-qekrRkgSQuuGW-BfM8",
  authDomain: "clashchatz.firebaseapp.com",
  projectId: "clashchatz",
  storageBucket: "clashchatz.firebasestorage.app",
  messagingSenderId: "75470322957",
  appId: "1:75470322957:web:89e5e370e17693e3f1c444",
  measurementId: "G-LPSSLW4JSN",
  databaseURL: "https://clashchatz-default-rtdb.firebaseio.com" // Realtime Database URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Auth & Database exports
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
