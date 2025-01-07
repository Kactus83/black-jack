import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/styles.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';
import initializeSocket from './services/socket';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

initializeSocket()
  .then((socket) => {
    socket.connect(); // Connexion manuelle
    console.log('[Socket] Connecté au serveur WebSocket.');
    root.render(
      <React.StrictMode>
        <Router>
          <App />
        </Router>
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error('Erreur critique : Impossible d\'initialiser le socket.', error);
  });

// Mesure de performance
reportWebVitals();
