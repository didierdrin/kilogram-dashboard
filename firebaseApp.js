// firebaseApp.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBXJ54NKqSJtM2wrqeAc3ny9cOrm2Rbzjc",
    authDomain: "kigali-laundry.firebaseapp.com",
    projectId: "kigali-laundry",
    storageBucket: "kigali-laundry.firebasestorage.app",
    messagingSenderId: "292575303808",
    appId: "1:292575303808:web:b880443583eaf8103dae65",
    measurementId: "G-J53JB5JEKG"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
