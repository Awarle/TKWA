const express = require('express');
const router = express.Router();
const { MongoClient, GridFSBucket } = require('mongodb');
const multer = require('multer');
const documentController = require('../controllers/documentController');
const auth = require('../middleware/authMiddleware');
const dotenv = require('dotenv');
dotenv.config();

// Configuration MongoDB avec GridFSBucket
const client = new MongoClient(process.env.MONGO_ATLAS_URL);

let bucket;
client.connect().then(() => {
  const db = client.db();
  bucket = new GridFSBucket(db, { bucketName: 'documents' });
  console.log('Connexion à MongoDB avec GridFSBucket réussie - documentRoutes');
}).catch(error => console.error('Erreur de connexion MongoDB:', error));

// Configuration de multer pour accepter tous les fichiers sans validation de nom
const upload = multer();

// Route pour gérer l'upload de fichiers et enregistrer les métadonnées
router.post('/upload', auth, upload.any(), async (req, res) => {
  try {
    await documentController.uploadDocument(req, res);
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    res.status(500).send({ message: 'Erreur lors de l\'upload', error });
  }
});

// Routes utilisant les contrôleurs pour les autres actions
router.get('/user', auth, (req, res) => documentController.getUserDocuments(req, res));
router.get('/printer', auth, (req, res) => documentController.getPrinterDocuments(req, res));
router.get('/file/:id', (req, res) => documentController.getFile(req, res));
router.put('/:id/status', auth, (req, res) => documentController.updateDocumentStatus(req, res));
router.delete('/:id', auth, (req, res) => documentController.deleteDocument(req, res));


module.exports = router;
