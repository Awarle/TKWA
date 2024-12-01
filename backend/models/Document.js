const mongoose = require('mongoose');

// Définition du schéma du document
const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  printer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Printer',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String, 
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId, // Référence vers GridFS
    required: function () {
      return !this.fileUrl; 
    },
  },
  status: {
    type: String,
    enum: ['Envoyé', 'En cours d\'impression', 'Imprimé'],
    default: 'Envoyé',
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Validation personnalisée pour s'assurer qu'au moins `fileUrl` ou `fileId` est présent
documentSchema.path('fileId').validate(function (value) {
  return this.fileUrl || this.fileId; // L'un des deux champs doit être présent
}, 'Soit fileUrl soit fileId doit être présent');

// Middleware pour ajuster le document si nécessaire avant l'enregistrement
documentSchema.pre('save', function (next) {
  if (!this.fileId && !this.fileUrl) {
    next(new Error('Le document doit avoir soit un fileUrl, soit un fileId.'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Document', documentSchema);
