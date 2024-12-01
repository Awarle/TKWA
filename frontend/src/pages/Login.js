import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Regex } from '../components/Regex';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'user',
  });

  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fonction de validation pour l'email et le mot de passe
  const validateForm = () => {
    let errors = {};

    // Validation de l'email
    if (!Regex.email.test(formData.email)) {
      errors.email = 'Adresse e-mail invalide.';
    }

    // Validation du mot de passe
    if (!Regex.password.test(formData.password)) {
      errors.password = 'Le mot de passe doit comporter au moins 12 caractères, incluant une majuscule, une minuscule, un chiffre et un caractère spécial.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // True si aucun erreur
  };

  // Soumettre le formulaire de connexion
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Exécuter la validation
    if (!validateForm()) {
      setError("Veuillez vérifier les informations fournies.");
      return;
    }

    try {
      let response;

      if (formData.userType === 'printer') {
        response = await axios.post('/api/printers/login', formData);
        localStorage.setItem('token', response.data.token);
        alert('Connexion Imprimerie réussie');
        navigate('/printer-dashboard');

          // Afficher les données pour le débogage
          console.log('Données envoyées :', { email, password });

          
      } else {
        response = await axios.post('/api/users/login', formData);
        localStorage.setItem('token', response.data.token);
        alert('Connexion réussie');
        navigate('/upload-document');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion', error);
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="bg-image">
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="card p-4" style={{ maxWidth: '400px', width: '100%' }}>
          <form onSubmit={handleSubmit}>
            <h2 className="text-center mb-4">Connexion</h2>
            {error && <p className="text-danger">{error}</p>}

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Adresse e-mail</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Adresse e-mail"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {formErrors.email && <p className="text-danger">{formErrors.email}</p>}
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Mot de passe</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {formErrors.password && <p className="text-danger">{formErrors.password}</p>}
            </div>

            {/* Lien "Mot de passe oublié" */}
            <div className="mb-3 text-center">
              <Link to="/change-password" className="text-decoration-none">Mot de passe oublié ?</Link>
            </div>

            {/* Boutons radio pour le type d'utilisateur */}
            <div className="mb-3">
              <label className="form-label">Type d'utilisateur :</label>
              <div>
                <div className="form-check form-check-inline">
                  <input
                    type="radio"
                    id="user"
                    name="userType"
                    value="user"
                    checked={formData.userType === 'user'}
                    onChange={handleChange}
                    className="form-check-input"
                  />
                  <label htmlFor="user" className="form-check-label">Utilisateur</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    type="radio"
                    id="printer"
                    name="userType"
                    value="printer"
                    checked={formData.userType === 'printer'}
                    onChange={handleChange}
                    className="form-check-input"
                  />
                  <label htmlFor="printer" className="form-check-label">Imprimerie</label>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100">Se connecter</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
