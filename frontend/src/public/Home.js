import React, { useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Make sure the CSS file is correctly imported

// List of local images to display
const images = [
  '/images/image3.jpg',
  '/images/image4.jpg',
];

const Home = () => {
  const [user, setUser] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate(); // Use navigate hook for routing

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    // Change the image every 5 seconds
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate('/home');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleSignUpRedirect = () => {
    navigate('/signup'); // Redirect to the signup page
  };

  const handleEvaluationRedirect = () => {
    navigate('/eval'); // Nouvelle route vers l'évaluation d'état
  };

  return (
    <div className="home-container">
      {/* Background image that changes automatically */}
      <div className="background-image">
        <img
          src={images[currentImageIndex]}
          alt="Background Culinary"
          className="image-background"
        />
      </div>

      <div className="content">
        <h1>Votre espace pour un esprit apaisé et équilibré.</h1>
        <p>
          {user ? (
            `Welcome, we're here to help you, ${user.email}.`
          ) : (
            `Welcome! You're safe here, we're here to support you.`
          )}
        </p>
        {/* Adjust buttons to match design style */}
        {user ? (
          <button className="button-logout" onClick={handleLogout}>Logout</button>
        ) : (
          <button className="button-login" onClick={handleLoginRedirect}>Sign In</button>
        )}
        <div className="explore-buttons">
          <button className="explore-button" onClick={handleSignUpRedirect}>Sign Up</button>
          <button className="explore-button" onClick={handleEvaluationRedirect}>
            Évaluer mon état
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;