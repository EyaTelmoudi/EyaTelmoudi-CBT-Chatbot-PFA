import React, { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { useNavigate } from "react-router-dom"; // 🔄 Importation du hook React Router
import './form.css'; // Importation du fichier CSS

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
const db = getFirestore(app);
const auth = getAuth(app);

const staiQuestions = [
  "Je me sens calme.",
  "Je me sens tendu(e).",
  "Je me sens excité(e).",
  "Je regrette certaines choses.",
  "Je suis en sécurité.",
  "Je me sens inquiet/inquiète.",
  "Je me sens satisfait(e).",
  "Je suis ennuyé(e).",
  "Je me sens à l’aise.",
  "Je me sens nerveux(se).",
  "Je suis bien reposé(e).",
  "Je me sens préoccupé(e).",
  "Je me sens détendu(e).",
  "Je me sens content(e).",
  "Je me sens indécis(e).",
  "Je me sens effrayé(e).",
  "Je me sens agréable.",
  "J’ai l’impression que je vais m’évanouir.",
  "Je me sens confiant(e).",
  "Je me sens tendu(e) intérieurement."
];

const options = [
  { label: "Pas du tout", value: 1 },
  { label: "Un peu", value: 2 },
  { label: "Moyennement", value: 3 },
  { label: "Tout à fait", value: 4 }
];

export default function STAIForm() {
  const [responses, setResponses] = useState(Array(20).fill(null));
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [avantApres, setAvantApres] = useState("avant");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(""); // Ajout du champ identifiant
  const [userFirstName, setUserFirstName] = useState(""); // Ajout du champ prénom
  const [userLastName, setUserLastName] = useState(""); // Ajout du champ nom

  const navigate = useNavigate(); // 🔄 Hook pour navigation

  const getUserName = async () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = collection(db, "users");
      const userQuery = await getDocs(userRef);
      const userData = userQuery.docs.find(doc => doc.id === user.uid);
      if (userData) {
        setUserName(userData.data().name);
      }
    }
  };

  useEffect(() => {
    getUserName();
  }, []);

  const handleChange = (index, value) => {
    const newResponses = [...responses];
    newResponses[index] = value;
    setResponses(newResponses);
  };

  const handleSubmit = async () => {
    if (responses.includes(null)) {
      alert("Veuillez répondre à toutes les questions.");
      return;
    }

    const total = responses.reduce((sum, val) => sum + val, 0);
    setScore(total);
    setSubmitted(true);

    try {
      await addDoc(collection(db, "stai_scores"), {
        responses,
        score: total,
        userName,
        userId,
        userFirstName,
        userLastName,
        avant_apres: avantApres,
        timestamp: serverTimestamp()
      });
      console.log("Score enregistré avec succès");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
    }
  };

  return (
    <div className="form-container">
      <h1>Échelle STAI - Anxiété d'état</h1>
      <p>Indiquez à quel point chaque affirmation correspond à ce que vous ressentez maintenant.</p>

      {/* Section pour saisir l'identifiant, prénom et nom */}
      <div className="user-info-container">
        <label>
          Identifiant:
          <input 
            type="text" 
            value={userId} 
            onChange={(e) => setUserId(e.target.value)} 
            className="input-field" 
            required 
          />
        </label>
        <label>
          Prénom:
          <input 
            type="text" 
            value={userFirstName} 
            onChange={(e) => setUserFirstName(e.target.value)} 
            className="input-field" 
            required 
          />
        </label>
        <label>
          Nom:
          <input 
            type="text" 
            value={userLastName} 
            onChange={(e) => setUserLastName(e.target.value)} 
            className="input-field" 
            required 
          />
        </label>
      </div>

      <div className="space-y-8">
        {staiQuestions.map((question, index) => (
          <div key={index} className="question-item">
            <p className="question-text">{index + 1}. {question}</p>
            <div className="grid grid-cols-4 gap-6">
              {options.map((option, i) => (
                <label key={i} className="option-label">
                  <input
                    type="radio"
                    name={`q${index}`}
                    value={option.value}
                    checked={responses[index] === option.value}
                    onChange={() => handleChange(index, option.value)}
                    className="hidden"
                  />
                  <div className={`w-16 h-16 flex items-center justify-center rounded-full text-lg font-semibold ${responses[index] === option.value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} transition`}>
                    {option.label[0]}
                  </div>
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Ajout de la sélection "Avant ou Après" */}
      <div className="avant-apres-selection">
        <label>répondez-vous avant ou après la consultation ?</label>
        <select value={avantApres} onChange={(e) => setAvantApres(e.target.value)} className="select-input">
          <option value="avant">Avant</option>
          <option value="apres">Après</option>
        </select>
      </div>

      <div className="flex justify-center mt-8">
        <button
          className="submit-button"
          onClick={handleSubmit}
          type="button"
        >
          Soumettre
        </button>
      </div>

      {submitted && (
        <div className="score-container">
          <p className="score-text">Score total : {score} / 80</p>
          <p className={`score-${score < 40 ? 'low' : score > 60 ? 'high' : 'medium'}`}>
            {score < 40 && "Anxiété faible"}
            {score >= 40 && score <= 60 && "Anxiété modérée"}
            {score > 60 && "Anxiété élevée"}
          </p>
        </div>
      )}

      <button onClick={() => navigate("/home")} className="go-home-button">
        Retour à l'Accueil
      </button>
    </div>
  );
}