// src/pages/ForgotPassword.js

import React, { useState } from 'react';
import axios from 'axios';
import { Regex } from '../components/Regex';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation de l'email
    if (!Regex.email.test(email)) {
      setFormError('Adresse e-mail invalide.');
      return;
    }

    try {
      await axios.post('/api/password/forgot-password', { email });
      setMessage('Un e-mail de réinitialisation a été envoyé.');
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation', error);
      setFormError('Erreur lors de la demande de réinitialisation du mot de passe.');
    }
  };

  return (
    <div className="bg-image">
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="card p-4" style={{ maxWidth: '400px', width: '100%' }}>
          <form onSubmit={handleSubmit}>
            <h2 className="text-center mb-4">Mot de passe oublié</h2>
            {message && <p className="text-success">{message}</p>}
            {formError && <p className="text-danger">{formError}</p>}

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Adresse e-mail
              </label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Réinitialiser le mot de passe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
