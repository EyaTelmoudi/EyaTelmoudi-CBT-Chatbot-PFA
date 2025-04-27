const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const { spawn } = require('child_process');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDnFYbHg1Swv42Fl7HXwTYWPT58NoR6rK0",
  authDomain: "cbt-chat-b4012.firebaseapp.com",
  projectId: "cbt-chat-b4012",
  storageBucket: "cbt-chat-b4012.appspot.com",
  messagingSenderId: "271732410751",
  appId: "1:271732410751:web:421221458852006d58b24a",
  measurementId: "G-ZERDV0HDQF"
};

// Initialiser Firebase
const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);

const app = express();
const port = 4000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(bodyParser.json());

let sessions = {};

// Route principale de chat
app.post('/chat', async (req, res) => {
  try {
    const { message, model, language, userId } = req.body;

    if (!sessions[userId]) {
      sessions[userId] = {
        context: [],
        count: 0,
        startTime: new Date(),
        lastActivity: new Date()
      };
    }

    const session = sessions[userId];
    const now = new Date();
    const elapsedMinutes = (now - session.startTime) / (1000 * 60);
    const inactiveMinutes = (now - session.lastActivity) / (1000 * 60);

    if (elapsedMinutes >= 30 || (inactiveMinutes >= 30 && session.count > 0)) {
      let terminationMessage;
      switch (language) {
        case 'fr':
          terminationMessage = "Notre séance de 30 minutes est terminée. Nous reprendrons cela lors de notre prochaine rencontre. Prends soin de toi 🌼";
          break;
        case 'en':
          terminationMessage = "Our 30-minute session has ended. We'll continue this in our next meeting. Take care 🌼";
          break;
        case 'ar':
          terminationMessage = "انتهت جلسة ثلاثون دقائق. سنكمل هذا في لقائنا القادم. اعتني بنفسك 🌼";
          break;
        default:
          terminationMessage = "Our session time is over. We'll continue next time.";
      }

      await addDoc(collection(db, 'chats'), {
        message: "(session ended)",
        reply: terminationMessage,
        model,
        language,
        timestamp: now
      });

      delete sessions[userId];
      return res.json({ reply: terminationMessage });
    }

    session.lastActivity = now;

    let systemMessageContent = '';
    switch (language) {
      case 'fr':
        systemMessageContent = '[Réponds UNIQUEMENT en français]Tu es un psychologue bienveillant et attentionné...';
        break;
      case 'en':
        systemMessageContent = '[Respond ONLY in English]You are a kind and attentive psychologist...';
        break;
      case 'ar':
        systemMessageContent = '[أجب باللغة العربية فقط] أنت أخصائي نفسي طيب ومهتم...';
        break;
    }

    session.context.push({ role: "user", content: message });
    session.count++;

    const response = await axios.post('http://127.0.0.1:11434/v1/chat/completions', {
      model: model,
      messages: [
        { role: "system", content: systemMessageContent },
        ...session.context,
      ]
    });

    if (response.data?.choices?.[0]?.message?.content) {
      const chatbotReply = response.data.choices[0].message.content;
      session.context.push({ role: "assistant", content: chatbotReply });

      await addDoc(collection(db, 'chats'), {
        message,
        reply: chatbotReply,
        model,
        language,
        timestamp: now
      });

      return res.json({ reply: chatbotReply });
    }

    return res.status(500).json({ error: "Réponse invalide du chatbot." });
  } catch (error) {
    console.error("Erreur:", error.message);
    return res.status(500).json({ error: "Erreur lors de la communication avec le serveur." });
  }
});

// Route historique
app.get('/history', async (req, res) => {
  try {
    const chatSnapshot = await getDocs(collection(db, 'chats'));
    const chatHistory = chatSnapshot.docs.map(doc => doc.data());
    res.json(chatHistory);
  } catch (error) {
    console.error("Erreur de récupération de l'historique:", error.message);
    res.status(500).json({ error: "Impossible de récupérer l'historique." });
  }
});

// Route reconnaissance vocale (Vosk)
app.post('/speech-to-text', (req, res) => {
  console.log('🟡 Requête reçue à /speech-to-text');

  const pythonProcess = spawn('python', ['-u', 'total_vosk.py'], { cwd: __dirname });

  res.setHeader('Content-Type', 'text/plain');

  pythonProcess.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      if (line.startsWith('status:')) {
        const status = line.split(':')[1];
        console.log(`🔄 Statut reçu du modèle : ${status}`);
        res.write(JSON.stringify({ status }) + '\n');
      } else if (line.startsWith('{')) {
        try {
          const json = JSON.parse(line);
          console.log('✅ Résultat final :', json.text);
          res.write(JSON.stringify(json) + '\n');
        } catch (e) {
          console.error('🔴 JSON invalide :', e.message);
          console.error('🔎 Ligne reçue :', line);
        }
      } else {
        console.log('ℹ️ Sortie inattendue du script :', line);
      }
    });
  });

  pythonProcess.stderr.on('data', (err) => {
    console.error('🔴 Erreur Python :', err.toString());
  });

  pythonProcess.on('close', (code) => {
    console.log(`✅ Script terminé avec code ${code}`);
    res.end(); // Important
  });

  pythonProcess.on('error', (err) => {
    console.error('🚨 Échec de lancement du script Python :', err.message);
    res.status(500).send('Erreur lors de l’exécution du script Python');
  });
});

// Lancer le serveur
app.listen(port, () => {
  console.log(`🌐 Serveur Node.js principal en écoute sur http://localhost:${port}`);
});
