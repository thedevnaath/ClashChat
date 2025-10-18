// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2c7lO8VHi956b-qekrRkgSQuuGW-BfM8",
  authDomain: "clashchatz.firebaseapp.com",
  projectId: "clashchatz",
  storageBucket: "clashchatz.firebasestorage.app",
  messagingSenderId: "75470322957",
  appId: "1:75470322957:web:89e5e370e17693e3f1c444",
  measurementId: "G-LPSSLW4JSN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
