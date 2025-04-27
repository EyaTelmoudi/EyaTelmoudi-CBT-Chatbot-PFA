
import React, { useState, useEffect } from 'react';
import './../Chat.css';
import { db } from './../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function App() {
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedModel, setSelectedModel] = useState('gemma3:1b');
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setEmail(currentUser.email);
    }
  }, []);

  const addMessageToFirestore = async (email, question, reponse) => {
    try {
      const messagesRef = collection(db, 'messages');
      await addDoc(messagesRef, {
        email: email,
        question: question,
        reponse: reponse,
        timestamp: serverTimestamp(),
      });
      console.log('Message ajouté avec succès!');
    } catch (error) {
      console.error("Erreur lors de l'ajout du message :", error);
    }
  };

  const sendMessage = async () => {
    if (!userMessage || !email) return;

    const newUserMessage = {
      message: userMessage,
      sender: 'user',
    };

    setChatHistory((prevHistory) => [...prevHistory, newUserMessage]);
    await addMessageToFirestore(email, userMessage, 'user');

    setUserMessage('');

    try {
      const response = await fetch("http://localhost:4000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          model: selectedModel,
          language: selectedLanguage,
        }),
      });

      const data = await response.json();
      if (data.reply) {
        const newBotMessage = {
          message: data.reply,
          sender: 'bot',
        };

        await addMessageToFirestore(email, userMessage, data.reply);
        setChatHistory((prevHistory) => [...prevHistory, newBotMessage]);
      } else {
        const errorMessage = { message: "Erreur: Aucune réponse reçue.", sender: 'bot' };
        setChatHistory((prevHistory) => [...prevHistory, errorMessage]);
      }
    } catch (error) {
      const errorMessage = { message: "Erreur de connexion.", sender: 'bot' };
      setChatHistory((prevHistory) => [...prevHistory, errorMessage]);
    }
  };

  const goHome = () => {
    navigate('/home');
  };

  const startListening = async () => {
    console.log("🎤 Début de la reconnaissance vocale...");

    try {
      const response = await fetch("http://localhost:4000/speech-to-text", {
        method: "POST",
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let resultText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.trim().split("\n");

        lines.forEach((line) => {
          try {
            const data = JSON.parse(line);
            if (data.text) {
              console.log("📝 Transcription reçue :", data.text);
              resultText += data.text + " ";
              setUserMessage((prev) => prev + " " + data.text);
            } else if (data.status) {
              console.log("⏳ Statut :", data.status);
            }
          } catch (e) {
            console.error("🔴 Erreur de parsing :", e.message);
          }
        });
      }

      console.log("✅ Reconnaissance terminée :", resultText);
    } catch (error) {
      console.error("❌ Erreur pendant la reconnaissance vocale :", error.message);
    }
  };

  return (
    <div id="app-container">
      <div id="sidebar">
        <h2>Paramètres</h2>
        <div>
          <label htmlFor="modelSelect">Choisir un modèle :</label>
          <select
            id="modelSelect"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <option value="gemma3:1b">gemma3:1b</option>
            <option value="llama3.1:latest">llama3.1:latest</option>
            <option value="qwen2.5:7b">qwen2.5:7b</option>
            <option value="deepseek-r1:7b">deepseek-r1:7b</option>
            <option value="mistral:latest">mistral:latest</option>
          </select>
        </div>

        <div>
          <label htmlFor="languageSelect">Choisir la langue :</label>
          <select
            id="languageSelect"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="ar">عربي</option>
          </select>
        </div>
      </div>

      <div id="chat-container">
        <h1>Chat avec le Bot - CBT</h1>
        <div id="chatbox">
          {chatHistory.map((chat, index) => (
            <div key={index} className={`chat-message ${chat.sender}-message`}>
              {chat.message}
            </div>
          ))}
        </div>

        <div className="input-row">
          <input
            type="text"
            id="userInput"
            value={userMessage}
            placeholder="Écrivez un message..."
            onChange={(e) => setUserMessage(e.target.value)}
          />
          <button className="action-button" onClick={sendMessage}>Envoyer</button>
          <button className="action-button round-button" onClick={startListening}>🎤</button>
        </div>

        <button className="action-button" onClick={goHome}>Retour à l'Accueil</button>
      </div>
    </div>
  );
}

export default App;
