import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../firebaseConfig'; // Import Firestore

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Ajout d'un état de chargement pour indiquer quand la connexion est en cours
  const navigate = useNavigate();

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, redirige-le vers la page appropriée
    const currentUser = auth.currentUser;
    if (currentUser) {
      navigate('/'); // Redirige vers la page d'accueil ou une page appropriée
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Réinitialiser les erreurs précédentes
    setLoading(true); // Début de la connexion

    try {
      // Connexion de l'utilisateur avec email et mot de passe
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Récupération des informations de l'utilisateur depuis Firestore
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const userRole = userData.role; // Récupère le rôle de l'utilisateur

        // Stocker l'utilisateur dans le localStorage
        localStorage.setItem('user', JSON.stringify(userData));

        // Rediriger en fonction du rôle
        if (userRole === 'patient') {
          navigate('/chat'); // Rediriger vers la page de chat pour le patient
        } else if (userRole === 'medecin') {
          navigate('/hopital'); // Rediriger vers la page d'hôpital pour le médecin
        }
      } else {
        setError('Utilisateur non trouvé dans la base de données.');
      }
    } catch (error) {
      setError('Erreur de connexion. Veuillez vérifier vos informations.');
    } finally {
      setLoading(false); // Fin de la connexion
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center">Se connecter</h2>
        {error && <p className="text-danger text-center">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-control"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="blue-button w-100" disabled={loading}>
          {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center mt-3">
          Pas encore de compte ? <Link to="/signup">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;