import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../src/firebaseConfig';
import { collection, getDocs, query, where, limit, startAfter, updateDoc, doc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Hopital = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastVisible, setLastVisible] = useState(null);
  const [response, setResponse] = useState('');
  const [emailToReply, setEmailToReply] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const loaderRef = useRef(null);
  const navigate = useNavigate();

  const fetchChatHistory = async () => {
    if (!searchEmail) {
      setChatHistory([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const messagesRef = collection(db, 'messages');
      let q;

      // Si lastVisible est défini, alors récupère les messages à partir de la dernière position
      if (lastVisible) {
        q = query(
          messagesRef,
          where('email', '==', searchEmail),
          startAfter(lastVisible),
          limit(10)
        );
      } else {
        q = query(messagesRef, where('email', '==', searchEmail), limit(10));
      }

      const querySnapshot = await getDocs(q);
      const chatsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sortedChats = chatsData.sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);

      const filteredChats = sortedChats.filter((chat) => chat.reponse !== 'user');

      setChatHistory((prevChats) => [...prevChats, ...filteredChats]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setLoading(false);
      setIsSearched(true);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages :', error);
      setError('Impossible de récupérer les messages. Veuillez réessayer plus tard.');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/home');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString();
    }
    return 'Date inconnue';
  };

  const handleResponse = async (email) => {
    if (!response) {
      alert('Veuillez entrer une réponse avant de soumettre.');
      return;
    }

    try {
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (docSnapshot) => {
        const messageRef = doc(db, 'messages', docSnapshot.id);
        await updateDoc(messageRef, { reponse: response });
      });

      setResponse('');
      setEmailToReply('');
      fetchChatHistory();
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse : ", error);
    }
  };

  const handleScroll = () => {
    const bottom = loaderRef.current.getBoundingClientRect().bottom <= window.innerHeight;

    // Si l'utilisateur est au bas de la page et que les messages ne sont pas en cours de chargement
    if (bottom && !loading && lastVisible) {
      fetchChatHistory(); // Charger plus de messages si nécessaire
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
  };

  useEffect(() => {
    if (searchEmail) {
      fetchChatHistory();
    }
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [searchEmail]);

  const groupMessagesByDate = (messages) => {
    const grouped = [];
    let currentDate = '';

    messages.forEach((message) => {
      const messageDate = formatDate(message.timestamp);
      if (messageDate !== currentDate) {
        grouped.push({ date: messageDate, messages: [message] });
        currentDate = messageDate;
      } else {
        grouped[grouped.length - 1].messages.push(message);
      }
    });

    return grouped;
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Page Hôpital</h2>

      {/* Welcome message */}
      <div className="alert alert-info text-center">
        <h4>Bienvenue, Médecin !</h4>
        <p>Vous pouvez chercher une conversation de patient en utilisant l'email ci-dessous.</p>
      </div>

      {/* Logout Button */}
      <button className="btn btn-danger" onClick={handleLogout}>Déconnexion</button>

      {/* Affichage des erreurs */}
      {error && <div className="alert alert-danger text-center">{error}</div>}

      {/* Affichage de la barre de recherche */}
      <div className="mb-4">
        <div className="input-group">
          <input
            type="email"
            className="form-control"
            placeholder="Entrez un email pour rechercher une conversation de patient"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={fetchChatHistory}
            disabled={!searchEmail || loading}
          >
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
      </div>

      {/* Affichage du message de recherche */}
      {isSearched && chatHistory.length > 0 && (
        <p className="text-success text-center">
          {chatHistory.length} messages trouvés pour "{searchEmail}"
        </p>
      )}

      {/* Affichage des résultats */}
      {isSearched && (
        <div className="my-4">
          <h4>Historique des Discussions</h4>
          <div className="message-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <ul className="list-group">
              {loading ? (
                <div className="text-center">Chargement...</div>
              ) : chatHistory.length > 0 ? (
                groupMessagesByDate(chatHistory).map((group, index) => (
                  <div key={index}>
                    <li className="list-group-item list-group-item-info text-center">
                      <strong>{group.date}</strong>
                    </li>
                    {group.messages.map((chat) => (
                      <li key={chat.id} className="list-group-item">
                        <p><strong>Question :</strong> {chat.question}</p>
                        <p><strong>Réponse :</strong> {chat.reponse || 'Réponse en attente...'}</p>
                        <small>
                          <strong>Timestamp :</strong> {formatTimestamp(chat.timestamp)}
                        </small>

                        {!chat.reponse && !emailToReply && (
                          <button
                            className="btn btn-primary mt-2"
                            onClick={() => setEmailToReply(chat.email)}
                          >
                            Répondre
                          </button>
                        )}

                        {emailToReply === chat.email && (
                          <div>
                            <textarea
                              className="form-control mt-2"
                              rows="3"
                              value={response}
                              onChange={(e) => setResponse(e.target.value)}
                              placeholder="Écrire votre réponse ici..."
                            />
                            <button
                              className="btn btn-success mt-2"
                              onClick={() => handleResponse(chat.email)}
                            >
                              Envoyer la réponse
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                    <hr />
                  </div>
                ))
              ) : (
                <p>Aucun message trouvé pour cet email.</p>
              )}
            </ul>
          </div>
          <div ref={loaderRef} />
        </div>
      )}
    </div>
  );
};

export default Hopital;