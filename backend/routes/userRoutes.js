const express = require('express');
const router = express.Router();

const { registerUser, loginUser, getUserProfile, changePassword } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Route pour l'inscription d'un utilisateur
router.post('/register', registerUser);

// Route pour la connexion d'un utilisateur
router.post('/login', loginUser); 

// Route pour obtenir le profil de l'utilisateur (protégée par authentification)
router.get('/profile', authMiddleware, getUserProfile);

// Route pour changer le mot de passe de l'utilisateur (protégée par authentification)
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
