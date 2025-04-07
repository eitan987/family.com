// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzSULY0lOBQbKKvYq9vQeuELNeIQVjaao",
  authDomain: "family-f4d22.firebaseapp.com",
  projectId: "family-f4d22",
  storageBucket: "family-f4d22.firebasestorage.app",
  messagingSenderId: "676033750020",
  appId: "1:676033750020:web:1546494d9f159d951c8151"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(app);
const db = firebase.firestore(app);

// Enable offline persistence
db.enablePersistence()
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.log('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required for persistence
      console.log('Persistence not supported by this browser');
    }
  });

// Set up Firestore rules in the Firebase console:
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /families/{familyId} {
      allow read, write: if request.auth != null;
      
      match /users/{userId} {
        allow read, write: if request.auth != null;
      }
      
      match /tasks/{taskId} {
        allow read, write: if request.auth != null;
      }
      
      match /events/{eventId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
*/