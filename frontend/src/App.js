import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './public/Login';
import SignUp from './public/SignUp';
import Home from './public/Home';
import Chat from './public/Chat';        // Page de chat pour les patients
import Hopital from './public/Hopital';  // Page d'hôpital pour les médecins
import STAIForm from './public/Form';    // Ton formulaire STAI
import STAIScoreEvolution from './public/Form'; // Visualisation des scores
import HistoryPage from "./public/HistoryPage";  // Importation de la page d'historique
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/hopital" element={<Hopital />} />
        <Route path="/eval" element={<STAIForm />} />
        <Route path="/evol" element={<STAIScoreEvolution />} />
        <Route path="/historique" element={<HistoryPage />} />
      </Routes>
    </Router>
  );
};

export default App;