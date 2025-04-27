import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig'; // Import Firebase
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: 'patient',
    dateNaissance: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Création de l'utilisateur Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Enregistrement des données dans Firestore
      await setDoc(doc(db, "users", user.uid), {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        role: formData.role,
        dateNaissance: formData.dateNaissance,
      });

      navigate('/home'); // Redirige après inscription
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center">S'inscrire</h2>
        {error && <p className="text-danger text-center">{error}</p>}

        <form onSubmit={handleSignUp}>
          <div className="mb-3">
            <label className="form-label">Nom</label>
            <input type="text" className="form-control" name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Prénom</label>
            <input type="text" className="form-control" name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Mot de passe</label>
            <input type="password" className="form-control" name="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Date de naissance</label>
            <input type="date" className="form-control" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} required />
          </div>

          

          <button type="submit" className="btn btn-primary w-100">S'inscrire</button>
        </form>

        <p className="text-center mt-3">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
