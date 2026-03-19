import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, getDocs,
  doc, getDoc, deleteDoc, updateDoc, setDoc,
  query, orderBy, serverTimestamp, where, collectionGroup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZMDbY7ysONBeS4e0fM4VT_ncW4bmVa7w",
  authDomain: "a1-3195210-7d4c3.firebaseapp.com",
  projectId: "a1-3195210-7d4c3",
  storageBucket: "a1-3195210-7d4c3.firebasestorage.app",
  messagingSenderId: "935642875192",
  appId: "1:935642875192:web:3f2bd926753f8eb4452dcd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth, db,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  collection, addDoc, getDocs,
  doc, getDoc, deleteDoc, updateDoc, setDoc,
  query, orderBy, serverTimestamp, where, collectionGroup
};