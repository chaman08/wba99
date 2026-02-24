import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

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
export const firebaseFunctions = getFunctions(firebaseApp, "us-central1");

// Connect to emulators if explicitly requested via URL or localStorage
const useEmulator =
  window.location.search.includes("emulator=true") ||
  localStorage.getItem("use_firebase_emulator") === "true";

if (useEmulator && window.location.hostname === "localhost") {
  const { connectFunctionsEmulator } = await import("firebase/functions");
  const { connectAuthEmulator } = await import("firebase/auth");
  const { connectFirestoreEmulator } = await import("firebase/firestore");
  const { connectStorageEmulator } = await import("firebase/storage");

  try {
    connectFunctionsEmulator(firebaseFunctions, "localhost", 5001);
    connectAuthEmulator(firebaseAuth, "http://localhost:9099");
    connectFirestoreEmulator(firebaseDB, "localhost", 8080);
    connectStorageEmulator(firebaseStorage, "localhost", 9199);
    console.log("Connected to Firebase Emulators");
  } catch (e) {
    console.debug("Firebase emulators already connected or failed to connect");
  }
}
