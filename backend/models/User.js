const mongoose = require('mongoose');

// Définition du schéma de l'utilisateur
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Le nom d'utilisateur doit être unique
  },
  email: {
    type: String,
    required: true,
    unique: true, // L'adresse e-mail doit être unique
  },
  password: {
    type: String,
    required: true,
  },
  documentsSent: [
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
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
