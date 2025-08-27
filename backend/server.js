const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// Importation des routes
const userRoutes = require('./routes/userRoutes');
const printerRoutes = require('./routes/printerRoutes');
const documentRoutes = require('./routes/documentRoutes');
const passwordRoutes = require('./routes/passwordRoutes');

// // Test pour vérifier l'importation correcte des routes
// console.log("User Routes:", userRoutes);
// console.log("Printer Routes:", printerRoutes);
// console.log("Document Routes:", documentRoutes);

mongoose.connect(process.env.MONGO_ATLAS_URL)
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch((err) => console.error('Erreur de connexion à MongoDB :', err));

app.use('/api/users', userRoutes);
app.use('/api/printers', printerRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/password', passwordRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Le serveur est en cours d'exécution sur le port ${PORT}`);
});
