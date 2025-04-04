import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCzSULY0lOBQbKKvYq9vQeuELNeIQVjaao",
  authDomain: "family-f4d22.firebaseapp.com",
  projectId: "family-f4d22",
  storageBucket: "family-f4d22.firebasestorage.app",
  messagingSenderId: "676033750020",
  appId: "1:676033750020:web:1546494d9f159d951c8151",
  measurementId: "G-740KXJPEJ1"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, get };