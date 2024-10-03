// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBjvXSWO-drt6YNS32UhczAzvls7xBmK9Q",
  authDomain: "medbot-12052.firebaseapp.com",
  projectId: "medbot-12052",
  storageBucket: "medbot-12052.appspot.com",
  messagingSenderId: "379296347949",
  appId: "1:379296347949:web:56aed9cc5b0f040acdc5a4",
  measurementId: "G-8CW6HFJB6W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
