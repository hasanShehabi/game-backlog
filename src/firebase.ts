// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBjrTMdfonhnhDFhA3jsVICQgRJX46SFb4",
    authDomain: "gamereleases-14f19.firebaseapp.com",
    projectId: "gamereleases-14f19",
    storageBucket: "gamereleases-14f19.firebasestorage.app",
    messagingSenderId: "200031354136",
    appId: "1:200031354136:web:f52a3bda14ca90d628726d",
    measurementId: "G-8TJPK4HB1W"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
