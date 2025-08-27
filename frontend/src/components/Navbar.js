// Navbar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isAuthenticated, logout } from '../utils/auth';

const Navbar = () => {
  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const location = useLocation();
  const currentPath = location.pathname;

  const showOnlyLogout =
    isAuthenticated() &&
    (currentPath === '/upload-document' || currentPath === '/printerdashboard');

  if (showOnlyLogout) {
    // Afficher uniquement le bouton "Déconnexion" sur les pages spécifiées
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            Tokwa
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <button className="btn btn-outline-light" onClick={handleLogout}>
                  Déconnexion
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  } else {
    // Afficher la barre de navigation habituelle sur les autres pages
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            Tokwa
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Accueil
                </Link>
              </li>
              {isAuthenticated() ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/upload-document">
                      Envoyer un Document
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-outline-light" onClick={handleLogout}>
                      Déconnexion
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">
                      Connexion
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/register">
                      Inscription
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    );
  }
};

export default Navbar;
