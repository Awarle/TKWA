import { jwtDecode } from 'jwt-decode';

// Fonction pour obtenir le token depuis le stockage local
export const getToken = () => {
  return localStorage.getItem('token');
};

// Fonction pour obtenir les informations de l'utilisateur
export const getUser = () => {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
};

// Fonction pour vérifier si l'utilisateur est authentifié
export const isAuthenticated = () => {
  return !!getToken();
};

// Fonction pour déconnecter l'utilisateur
export const logout = () => {
  localStorage.removeItem('token');
};







