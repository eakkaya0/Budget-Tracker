// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6kzIQdng01-KnzTNY0juMFDPwybP0o2Y",
  authDomain: "giderap.firebaseapp.com",
  projectId: "giderap",
  storageBucket: "giderap.firebasestorage.app",
  messagingSenderId: "398021903501",
  appId: "1:398021903501:web:5010314add3a09594a8ec4",
  measurementId: "G-1YH09ZBK2C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app)

export {app, db}