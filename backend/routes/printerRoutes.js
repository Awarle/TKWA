const express = require('express');
const router = express.Router();
const {
  registerPrinter,
  loginPrinter,
  getPrintersByPostalCode,
  getPrinterProfile,
  updatePrinterAddress,
  getAllPrinters
} = require('../controllers/printerController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes pour l'inscription et la connexion
router.post('/register', registerPrinter);
router.post('/login', printerController.loginPrinter);

// Autres routes pour la gestion des imprimantes
router.get('/profile', authMiddleware, getPrinterProfile);
router.get('/search', getPrintersByPostalCode);
router.get('/', getAllPrinters);
router.put('/update-address', authMiddleware, updatePrinterAddress);

module.exports = router;
