// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCM9Xm_Dfow5CH7Vj_Wqph1C_Uq-nw5zE4",
  authDomain: "expensemanagement-6c990.firebaseapp.com",
  projectId: "expensemanagement-6c990",
  storageBucket: "expensemanagement-6c990.firebasestorage.app",
  messagingSenderId: "320693337345",
  appId: "1:320693337345:web:9f8a1fc7b46ed0f17aaf00",
  measurementId: "G-LN62PC2LXC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
