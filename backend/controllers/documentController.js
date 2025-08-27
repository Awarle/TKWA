const Document = require('../models/Document');
const User = require('../models/User');
const Printer = require('../models/Printer');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const { MongoClient, GridFSBucket } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

// Configuration pour MongoDB et GridFSBucket
let bucket;
(async () => {
  const client = new MongoClient(process.env.MONGO_ATLAS_URL);
  await client.connect();
  const db = client.db();
  bucket = new GridFSBucket(db, { bucketName: 'documents' });
  console.log('Connexion à MongoDB avec GridFSBucket réussie - documentController');
})();

// Configuration de nodemailer pour l'envoi d'emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Fonction pour l'envoi d'un document et son stockage dans GridFS
const uploadDocument = async (req, res) => {
  console.log("Début de l'uploadDocument");
  console.log("Fichiers reçus :", req.files);
  console.log("Utilisateur :", req.user);

  try {
    const { printerId } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Aucun fichier téléchargé.' });
    }

    const uploadedFile = req.files[0];
    const fileName = uploadedFile.originalname;

    // Ouvrir le flux de téléchargement dans GridFS
    const uploadStream = bucket.openUploadStream(fileName);
    uploadStream.end(uploadedFile.buffer);

    uploadStream.on('error', (error) => {
      console.error("Erreur d'upload GridFS :", error);
      res.status(500).json({ message: "Erreur d'upload", error });
    });

    uploadStream.on('finish', async () => {
      console.log("Upload terminé avec succès, ID de fichier :", uploadStream.id);
      try {
        // Créer un nouveau document avec l'ID du fichier stocké
        const document = new Document({
          user: req.user.id,
          printer: printerId,
          fileName,
          fileId: uploadStream.id, // Stockage correct de l'ID du fichier
          status: 'Envoyé',
        });

        await document.save();

        // Mise à jour des documentsSent et documentsReceived avec l'ID du document
        await User.findByIdAndUpdate(req.user.id, { $push: { documentsSent: document._id } });
        await Printer.findByIdAndUpdate(printerId, { $push: { documentsReceived: document._id } });

        res.status(201).json({ message: 'Document envoyé avec succès.', document });
      } catch (error) {
        console.error("Erreur lors de l'enregistrement des métadonnées du document :", error);
        res.status(500).json({ message: "Erreur lors de l'enregistrement des métadonnées du document.", error });
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du document :", error);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};

// Fonction pour obtenir les documents d'un utilisateur
const getUserDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.id });
    res.json(documents);
  } catch (error) {
    console.error("Erreur lors de la récupération des documents de l'utilisateur :", error);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};

// Fonction pour obtenir les documents reçus par une imprimerie
const getPrinterDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ printer: req.user.id }).populate('user');
    res.json(documents);
  } catch (error) {
    console.error("Erreur lors de la récupération des documents de l'imprimerie :", error);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};


// Fonction pour récupérer un fichier depuis GridFSBucket en utilisant l'ID du document
const getFile = async (req, res) => {
  try {
    const documentId = req.params.id;

    // Vérifier si l'ID du document est valide
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({ message: 'ID du document invalide.' });
    }

    // Récupérer le document pour obtenir le fileId
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé.' });
    }

    const fileId = document.fileId;

    // Vérifier si l'ID du fichier est valide
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: 'ID de fichier invalide.' });
    }

    const objectId = new mongoose.Types.ObjectId(fileId);

    // Vérifier si le fichier existe dans GridFS
    const files = await bucket.find({ _id: objectId }).toArray();
    if (files.length === 0) {
      return res.status(404).json({ message: 'Fichier non trouvé dans GridFS.' });
    }

    const downloadStream = bucket.openDownloadStream(objectId);

    res.set('Content-Type', files[0].contentType || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${files[0].filename}"`);

    downloadStream.on('error', (error) => {
      console.error("Erreur de lecture du fichier :", error);
      return res.status(404).json({ message: 'Erreur lors de la lecture du fichier.' });
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error("Erreur lors de la récupération du fichier :", error);
    res.status(500).json({ message: 'Erreur lors de la récupération du fichier.' });
  }
};

// Fonction pour supprimer un document et le fichier associé
const deleteDocument = async (req, res) => {
  try {
    const documentId = req.params.id;

    // Vérifier si l'ID du document est valide
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({ message: 'ID du document invalide.' });
    }

    // Récupérer le document
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé.' });
    }

    const fileId = document.fileId;

    // Supprimer le fichier de GridFS
    if (mongoose.Types.ObjectId.isValid(fileId)) {
      const objectId = new mongoose.Types.ObjectId(fileId);
      await bucket.delete(objectId);
    }

    // Supprimer le document de la collection Documents
    await Document.findByIdAndDelete(documentId);

    // Mettre à jour les références dans User et Printer
    await User.findByIdAndUpdate(document.user, { $pull: { documentsSent: documentId } });
    await Printer.findByIdAndUpdate(document.printer, { $pull: { documentsReceived: documentId } });

    res.json({ message: 'Document supprimé avec succès.' });
  } catch (error) {
    console.error("Erreur lors de la suppression du document :", error);
    res.status(500).json({ message: 'Erreur lors de la suppression du document.' });
  }
};

// Fonction pour mettre à jour le statut d'un document
const updateDocumentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const documentId = req.params.id;

    const document = await Document.findByIdAndUpdate(documentId, { status }, { new: true });

    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé.' });
    }

    if (status === 'Imprimé') {
      const user = await User.findById(document.user);
      if (user) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Votre document a été imprimé',
          text: `Bonjour ${user.username},\n\nVotre document "${document.fileName}" a été imprimé avec succès.\n\nCordialement,\nVotre équipe d'impression.`,
        });
      }

      // Appeler la fonction de suppression du document
      req.params.id = documentId; // S'assurer que l'ID est bien défini dans req.params
      await deleteDocument(req, res);

      // Retourner après la suppression pour éviter les erreurs de réponse multiple
      return;
    }

    res.json({ message: 'Statut du document mis à jour.', document });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut du document :", error);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};

module.exports = {
  uploadDocument,
  getUserDocuments,
  getPrinterDocuments,
  getFile,
  updateDocumentStatus,
  deleteDocument,
};
