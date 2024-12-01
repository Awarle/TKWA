const mongoose = require('mongoose');

// Définition du schéma de l'imprimerie
const printerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // L'email doit être unique
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    default: '', // Adresse par défaut vide
  },
  postalCode: {
    type: String,
    default: '', // Code postal par défaut vide
  },
  coordinates: {
    lat: {
      type: Number,
      default: null, // Latitude par défaut null
    },
    lng: {
      type: Number,
      default: null, // Longitude par défaut null
    },
  },
  documentsReceived: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
  ],
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  // Vous pouvez ajouter d'autres champs si nécessaire
});

// Vérifier si le modèle a déjà été compilé
module.exports = mongoose.models.Printer || mongoose.model('Printer', printerSchema);
