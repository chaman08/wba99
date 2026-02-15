import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCj6-nhcdGKRn1BTXRVJjMWZGhSpjUEgG0",
  authDomain: "wba99-c7a6a.firebaseapp.com",
  projectId: "wba99-c7a6a",
  storageBucket: "wba99-c7a6a.firebasestorage.app",
  messagingSenderId: "374035559655",
  appId: "1:374035559655:web:bfa72f46484d1f1c981e42",
  measurementId: "G-JNSM2WCMGT",
};

const createFirebaseApp = () => {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
};

export const firebaseApp = createFirebaseApp();
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDB = getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);
