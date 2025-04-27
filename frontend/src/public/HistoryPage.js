import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import './history.css'; // Ajoutez votre fichier CSS ici pour styliser la table

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

export default function HistoryPage() {
  const [history, setHistory] = useState([]); // Contient tous les résultats
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Terme de recherche
  const [filteredHistory, setFilteredHistory] = useState([]); // Résultats filtrés

  // Fonction pour récupérer les données
  const fetchScores = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "stai_scores"));
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(results); // Stocker les résultats dans l'état global
    } catch (error) {
      console.error("Erreur lors de la récupération des scores:", error);
    }
    setLoading(false);
  };

  // Utilisation de useEffect pour charger les scores au démarrage
  useEffect(() => {
    fetchScores();
  }, []);

  // Fonction de recherche
  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setFilteredHistory([]); // Si la recherche est vide, on ne montre rien
    } else {
      const results = history.filter(item => 
        item.userFirstName && item.userFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.userLastName && item.userLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.userId && item.userId.includes(searchTerm)
      );
      setFilteredHistory(results); // Mettre à jour filteredHistory avec les résultats filtrés
    }
  };

  return (
    <div className="history-page">
      <h1>Historique des Scores STAI</h1>

      {/* Barre de recherche */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Rechercher par identifiant, prénom ou nom"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">Rechercher</button>
      </div>

      {/* Affichage de la table avec les résultats filtrés */}
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          {filteredHistory.length === 0 && searchTerm !== "" ? (
            <p>Aucun résultat trouvé pour "{searchTerm}"</p>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Score</th>
                  <th>Avant / Après Consultation</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((scoreData, index) => (
                  <tr key={index}>
                    <td>{scoreData.userFirstName} {scoreData.userLastName}</td>
                    <td>{scoreData.score}</td>
                    <td>{scoreData.avant_apres === 'avant' ? 'Avant' : 'Après'}</td>
                    <td>{new Date(scoreData.timestamp?.seconds * 1000).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Option de retour à l'accueil */}
      <button className="back-button" onClick={() => window.location.href = "/home"}>
        Retour à l'Accueil
      </button>
    </div>
  );
}