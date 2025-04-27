// Importation des modules Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDnFYbHg1Swv42Fl7HXwTYWPT58NoR6rK0",
  authDomain: "cbt-chat-b4012.firebaseapp.com",
  projectId: "cbt-chat-b4012",
  storageBucket: "cbt-chat-b4012.firebasestorage.app",
  messagingSenderId: "271732410751",
  appId: "1:271732410751:web:421221458852006d58b24a",
  measurementId: "G-ZERDV0HDQF"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Initialisation de Firebase Auth et Firestore
const auth = getAuth(app);   // Assurez-vous d'utiliser l'app initialisée
const db = getFirestore(app); // Assurez-vous d'utiliser l'app initialisée

// Exportation des instances
export { auth, db };
