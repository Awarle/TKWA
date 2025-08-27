import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Regex } from '../components/Regex';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fonction de validation
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
    return Object.keys(errors).length === 0; // Retourne true si aucune erreur
  };

  // Soumettre le formulaire d'inscription
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Exécuter la validation
    if (!validateForm()) {
      setError("Certaines informations ne sont pas valides.");
      return;
    }

    try {
      let userData;

      if (formData.role === 'printer') {
        userData = {
          name: formData.name,
          postalCode: formData.postalCode,
          email: formData.email,
          password: formData.password,
        };
        const response = await axios.post('/api/printers/register', userData);
        alert(response.data.message);
        navigate('/PrinterDashboard');
      } else {
        userData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        };
        const response = await axios.post('/api/users/register', userData);
        alert(response.data.message);
        navigate('/upload-document');
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription", error);
      setError("Erreur lors de l'inscription. Veuillez vérifier les informations fournies.");
    }
  };

  return (
    <div className="bg-image">
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="card p-4" style={{ maxWidth: '500px', width: '100%' }}>
          <h2 className="text-center mb-4">Inscription</h2>
          {error && <p className="text-danger">{error}</p>}

          {/* Sélection du rôle */}
          <div className="mb-3">
            <label className="form-label">Je suis :</label>
            <div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formData.role === 'user'}
                  onChange={handleChange}
                  className="form-check-input"
                  id="roleUser"
                />
                <label htmlFor="roleUser" className="form-check-label">
                  Utilisateur
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  name="role"
                  value="printer"
                  checked={formData.role === 'printer'}
                  onChange={handleChange}
                  className="form-check-input"
                  id="rolePrinter"
                />
                <label htmlFor="rolePrinter" className="form-check-label">
                  Imprimerie
                </label>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Formulaire pour utilisateurs */}
            {formData.role === 'user' && (
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Nom d'utilisateur"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
            )}

            {/* Formulaire pour imprimeries */}
            {formData.role === 'printer' && (
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Nom de l'imprimerie
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nom de l'imprimerie"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
            )}

            {/* Champ email */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Adresse e-mail
              </label>
              <input
                type="email"
                name="email"
                placeholder="Adresse e-mail"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-control"
              />
              {formErrors.email && <p className="text-danger">{formErrors.email}</p>}
            </div>

            {/* Champ mot de passe */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-control"
              />
              {formErrors.password && <p className="text-danger">{formErrors.password}</p>}
            </div>

            <button type="submit" className="btn btn-primary w-100">
              S'inscrire
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
