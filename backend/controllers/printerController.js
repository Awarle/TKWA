const Printer = require('../models/Printer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../services/emailService');

// Expressions régulières pour la validation
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

// Fonction pour envoyer un e-mail de bienvenue
const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Bienvenue sur notre plateforme !',
    text: `Bonjour ${name},\n\nMerci de vous être inscrit sur notre plateforme d'impression. Nous sommes ravis de vous accueillir !\n\nCordialement,\nL'équipe`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail de bienvenue envoyé avec succès');
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail de bienvenue", error);
  }
};

// Fonction pour inscrire une nouvelle imprimerie
exports.registerPrinter = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Valider l'email
    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: 'Adresse e-mail invalide.' });
    }

    // Valider le mot de passe
    if (!passwordPattern.test(password)) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 12 caractères, avec des lettres majuscules, minuscules, un chiffre et un symbole spécial.' });
    }

    // Vérifier si l'imprimerie existe déjà
    const printerExists = await Printer.findOne({ email });
    if (printerExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    // Créer une nouvelle imprimerie avec mot de passe haché
    const printer = new Printer({
      name,
      email,
      password: bcrypt.hashSync(password, 10),
    });

    // Sauvegarder l'imprimerie dans la base de données
    await printer.save();

    // Envoyer l'e-mail de bienvenue
    await sendWelcomeEmail(email, name);

    // Générer un token JWT
    const token = jwt.sign({ id: printer._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      token,
      printer: {
        id: printer._id,
        name: printer.name,
        email: printer.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur lors de l\'inscription.' });
  }
};

// Fonction pour connecter une imprimerie
exports.loginPrinter = async (req, res) => {
  try {

    console.log('Requête reçue :', req.body); // Afficher les données reçues

    const { email, password } = req.body;

    // Rechercher l'imprimerie par email
    const printer = await Printer.findOne({ email });
    if (!printer) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
    }

    // Vérifier le mot de passe
    const isMatch = bcrypt.compareSync(password, printer.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
    }

    // Générer un token JWT
    const token = jwt.sign({ id: printer._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      printer: {
        id: printer._id,
        name: printer.name,
        email: printer.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};

// Fonction pour obtenir le profil de l'imprimerie connectée
exports.getPrinterProfile = async (req, res) => {
  try {
    const printer = await Printer.findById(req.user.id).select('-password');
    res.json(printer);
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};

// Fonction pour rechercher les imprimantes par code postal
exports.getPrintersByPostalCode = async (req, res) => {
  try {
    const { postalCode } = req.query;

    // Rechercher les imprimantes avec le code postal fourni
    const printers = await Printer.find({ postalCode });
    res.json(printers);
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur lors de la recherche par code postal.' });
  }
};

// Fonction pour obtenir toutes les imprimantes
exports.getAllPrinters = async (req, res) => {
  try {
    const printers = await Printer.find().select('-password');
    res.json(printers);
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur lors de la récupération des imprimantes.' });
  }
};

// Fonction pour mettre à jour l'adresse d'une imprimerie
exports.updatePrinterAddress = async (req, res) => {
  try {
    const { address, postalCode, coordinates } = req.body;

    // Valider l'adresse et les coordonnées
    if (!address || !postalCode || !coordinates || !coordinates.lat || !coordinates.lng) {
      return res.status(400).json({ message: 'Données d\'adresse incomplètes.' });
    }

    // Trouver l'imprimerie à partir de l'ID de l'utilisateur connecté
    const printer = await Printer.findById(req.user.id);

    if (!printer) {
      return res.status(404).json({ message: 'Imprimerie non trouvée.' });
    }

    // Mettre à jour l'adresse et les coordonnées
    printer.address = address;
    printer.postalCode = postalCode;
    printer.coordinates = coordinates;

    // Sauvegarder les modifications dans la base de données
    await printer.save();

    res.status(200).json({ message: 'Adresse mise à jour avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur lors de la mise à jour de l\'adresse.' });
  }
};
