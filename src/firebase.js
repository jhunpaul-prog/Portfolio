import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBdZ46LacUY2qOY2iy1mW_VoA20O49nfEk",
  authDomain: "portfolio-434e9.firebaseapp.com",
  projectId: "portfolio-434e9",
  storageBucket: "portfolio-434e9.firebasestorage.app",
  messagingSenderId: "442623407629",
  appId: "1:442623407629:web:b9a0e264b1181892aa8744",
  measurementId: "G-WRVDTGM471",
};

const app = initializeApp(firebaseConfig);

// Export Firestore Database and Auth services
export const db = getFirestore(app);
export const auth = getAuth(app);
