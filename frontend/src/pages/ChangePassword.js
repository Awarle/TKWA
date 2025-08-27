import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Regex } from '../components/Regex';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/ChangePassword.css';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    userType: 'user', // Valeur par défaut, peut être 'user' ou 'printer'
  });

  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validation du formulaire
  const validateForm = () => {
    let errors = {};

    // Validation de l'email
    if (!Regex.email.test(formData.email)) {
      errors.email = 'Adresse e-mail invalide.';
    }

    // Validation du nouveau mot de passe
    if (!Regex.password.test(formData.newPassword)) {
      errors.newPassword =
        'Le nouveau mot de passe doit comporter au moins 12 caractères, incluant une majuscule, une minuscule, un chiffre et un caractère spécial.';
    }

    // Vérification de la confirmation du mot de passe
    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // True si aucune erreur
  };

  // Soumettre le formulaire de changement de mot de passe
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Exécuter la validation
    if (!validateForm()) {
      setError('Veuillez vérifier les informations fournies.');
      return;
    }

    try {
      // Déterminer le type d'utilisateur et construire l'URL
      const { userType, email, oldPassword, newPassword } = formData;
      const url = `/api/password/${userType}/change-password`;

      // Requête pour changer le mot de passe
      await axios.put(url, {
        email,
        oldPassword,
        newPassword,
      });

      alert('Mot de passe modifié avec succès');
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la modification du mot de passe', error);
      setError('Erreur lors de la modification du mot de passe');
    }
  };

  return (
    <div className="bg-image">
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="card p-4" style={{ maxWidth: '400px', width: '100%' }}>
          <form onSubmit={handleSubmit}>
            <h2 className="text-center mb-4">Changer de mot de passe</h2>
            {error && <p className="text-danger">{error}</p>}

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Adresse e-mail
              </label>
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
              <label htmlFor="oldPassword" className="form-label">
                Mot de passe actuel
              </label>
              <input
                type="password"
                name="oldPassword"
                className="form-control"
                placeholder="Mot de passe actuel"
                value={formData.oldPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                name="newPassword"
                className="form-control"
                placeholder="Nouveau mot de passe"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
              {formErrors.newPassword && <p className="text-danger">{formErrors.newPassword}</p>}
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmez le nouveau mot de passe
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Confirmez le nouveau mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {formErrors.confirmPassword && (
                <p className="text-danger">{formErrors.confirmPassword}</p>
              )}
            </div>

            {/* Sélection du type d'utilisateur */}
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
                  <label htmlFor="user" className="form-check-label">
                    Utilisateur
                  </label>
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
                  <label htmlFor="printer" className="form-check-label">
                    Imprimerie
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Changer le mot de passe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
