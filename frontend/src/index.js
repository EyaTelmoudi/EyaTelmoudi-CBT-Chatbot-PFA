// index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Importation de 'react-dom/client'
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';



// Création du root à l'aide de createRoot pour React 18 et versions supérieures
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
