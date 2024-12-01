const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
const authMiddleware = require('../middleware/authMiddleware');

// Route pour changer le mot de passe d'un utilisateur
router.put('/user/change-password', authMiddleware, passwordController.changeUserPassword);

// Route pour changer le mot de passe d'une imprimerie
router.put('/printer/change-password', authMiddleware, passwordController.changePrinterPassword);

// Route pour demander la réinitialisation du mot de passe
router.post('/forgot-password', passwordController.forgotPassword);


module.exports = router;
