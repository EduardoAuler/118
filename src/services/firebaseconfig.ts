// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvYIHKN08d4KDzCPbNJI1ccOg2SInji6U",
  authDomain: "posturoscience-60062.firebaseapp.com",
  projectId: "posturoscience-60062",
  storageBucket: "posturoscience-60062.firebasestorage.app",
  messagingSenderId: "724542300299",
  appId: "1:724542300299:web:1b0483fbb5578d4d27748e",
  measurementId: "G-FYCR2K4TP3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;
