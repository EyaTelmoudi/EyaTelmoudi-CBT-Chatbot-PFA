# 🧠 Chatbot de gestion du stress basé sur la CBT (PFA)

## 📚 Description

Ce projet propose une **application web** intégrant des **modèles LLM** pour aider à la gestion du stress à travers des techniques issues de la **thérapie cognitivo-comportementale (CBT)**.  
Le projet repose sur une architecture **backend Node.js** et **frontend React**.

Notre solution repose sur l'utilisation locale de modèles grâce à **Ollama** pour garantir :
- La confidentialité des données.
- La rapidité d'exécution.
- Le multilinguisme (français, arabe, anglais).

---

## 🛠️ Fonctionnalités principales

- Chatbot empathique basé sur les LLMs.
- Reconnaissance vocale en français (via Vosk).
- Frontend interactif en React.
- Backend Node.js pour la gestion des API et des sessions.
- Multimodèles : Gemma 3, LLaMA 3.1, Qwen 2.5, Mistral 7B, DeepSeek R1.

---

## 🚀 Étapes d'installation et de lancement

### 1. Installation d'Ollama
Téléchargez Ollama depuis leur site officiel :  
👉 [https://ollama.com/](https://ollama.com/)

Installez-le suivant votre système d'exploitation.

---

### 2. Lancer les modèles via Ollama

Dans votre terminal, lancez :

``bash
ollama run gemma3:1b
ollama run llama3.1:latest
ollama run mistral:latest
ollama run qwen2.5:7b
ollama run deepseek-r1:7b

Assurez-vous que Ollama fonctionne correctement.

### 3. Cloner le dépôt GitHub du projet
git clone https://github.com/EyaTelmoudi/EyaTelmoudi-CBT-Chatbot-PFA.git
cd CBT-Chatbot-PFA


### 4. Ouvrir le projet dans Visual Studio Code
code .


### 5. Installer Node.js
Téléchargez et installez :

Recommandé : Node.js v20.11.1

Vérifiez l'installation :
node --version
npm --version

### 6. Installer les dépendances
Dans le dossier backend (qui contient le fichier package.json) :
cd backend
npm install


Puis dans le dossier frontend React (mon-app) :
cd ../mon-app
npm install

### 7. Installer Vosk Model (français)
Téléchargez le modèle vosk-model-fr-0.22
Placez-le dans : backend/vosk-model-fr-0.22/
Le serveur backend utilisera ce modèle pour la reconnaissance vocale.

### 8. Lancer le serveur backend
Dans Visual Studio Code, ouvrez un terminal dans le dossier backend/ :
node server.js

### 9. Lancer l'application frontend
Dans un autre terminal, ouvrez le dossier mon-app/ :

npm start
Le frontend sera accessible à :
http://localhost:3000/home

### ✅ Vérifications finales
Le backend Node.js fonctionne sans erreurs.

Le frontend React se lance correctement.

L'interaction avec les LLMs et la reconnaissance vocale est opérationnelle.


### 👨‍💻 Technologies utilisées
Node.js

Express.js

React.js

Vosk Speech Recognition

Ollama

WebSockets

### 📋 Objectif principal
Offrir un support psychologique interactif, sécurisé et empathique basé sur la CBT, via des LLMs locaux et une interface web simple d'utilisation.

###🔥 Auteurs
Amor Eya

Sayeh Wiem

Telmoudi Aya

Projet encadré par Pr. Adel Alimi et Mme Onsa Lazzez.

