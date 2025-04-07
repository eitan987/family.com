// Import Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCzSULY0lOBQbKKvYq9vQeuELNeIQVjaao",
    authDomain: "family-f4d22.firebaseapp.com",
    databaseURL: "https://family-f4d22-default-rtdb.firebaseio.com",
    projectId: "family-f4d22",
    storageBucket: "family-f4d22.firebasestorage.app",
    messagingSenderId: "676033750020",
    appId: "1:676033750020:web:1546494d9f159d951c8151",
    measurementId: "G-740KXJPEJ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let familyId = localStorage.getItem("familyId") || "demo";
let tasks = [];
let events = [];
let messages = [];

async function loadData() {
    try {
        const familyRef = ref(db, `families/${familyId}`);
        const snapshot = await get(familyRef);
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            tasks = data.tasks || [];
            events = data.events || [];
            messages = data.messages || [];
            
            renderTasks();
            renderCalendar();
            renderMessages();
        }
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

async function saveData() {
    try {
        const familyRef = ref(db, `families/${familyId}`);
        await set(familyRef, {
            tasks,
            events,
            messages,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error saving data:", error);
    }
}