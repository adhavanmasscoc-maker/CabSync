// Developed by aknex
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  collection, 
  onSnapshot, 
  runTransaction, 
  setDoc, 
  updateDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyBp5c7M_NMJXJdqMoj4eDLCOuJ0NM3RIIA",
  authDomain: "cabsync-cit.firebaseapp.com",
  projectId: "cabsync-cit",
  storageBucket: "cabsync-cit.firebasestorage.app",
  messagingSenderId: "786834299683",
  appId: "1:786834299683:web:199332b2e80ca94c598a96",
  measurementId: "G-LBVBK5NDGV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ 
  prompt: "select_account", 
  hd: "citchennai.net" 
});

export {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  collection,
  onSnapshot,
  runTransaction,
  setDoc,
  updateDoc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
};
