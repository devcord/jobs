import { createContext, type PropsWithChildren, type FC } from 'react';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { type Firestore, getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "devcord-78331.firebaseapp.com",
  projectId: "devcord-78331",
  storageBucket: "devcord-78331.appspot.com",
  messagingSenderId: "888791640479",
  appId: process.env.APP_ID,
  measurementId: "G-XXGKD2SDF3"
};

export const FirestoreContext = createContext<Firestore | null>(null);

export const FirestoreProvider: FC<PropsWithChildren> = ({ children }) => {

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  const db = getFirestore(app);

  return (
    <FirestoreContext.Provider value={db}>
      {children}
    </FirestoreContext.Provider>
  );
};

