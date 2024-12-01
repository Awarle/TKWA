const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../services/emailService'); // Importation du module d'email

// Expressions régulières pour la validation
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Validation d'email simple
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/; // Mot de passe sécurisé

// Fonction pour envoyer un e-mail de bienvenue
const sendWelcomeEmail = async (email, username) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Bienvenue sur notre plateforme !',
    text: `Bonjour ${username},\n\nMerci de vous être inscrit sur notre plateforme. Nous sommes ravis de vous accueillir !\n\nCordialement,\nL'équipe`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail de bienvenue envoyé avec succès');
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail de bienvenue", error);
  }
};

// Fonction pour inscrire un nouvel utilisateur
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Valider l'email
    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: 'Adresse e-mail invalide.' });
    }

    // Valider le mot de passe
    if (!passwordPattern.test(password)) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 12 caractères, avec des lettres majuscules, minuscules, un chiffre et un symbole spécial.' });
    }

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    // Créer un nouvel utilisateur
    const user = new User({
      username,
      email,
      password: bcrypt.hashSync(password, 10), // Hachage du mot de passe
    });

    // Sauvegarder l'utilisateur dans la base de données
    await user.save();

    // Envoi de l'e-mail de bienvenue
    await sendWelcomeEmail(email, username);

    // Générer un token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Renvoyer le token et les informations de l'utilisateur
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};

// Fonction pour connecter un utilisateur
exports.loginUser = async (req, res) => {
  try {

    console.log('Requête reçue :', req.body); // Afficher les données reçues

    const { email, password } = req.body;

    // Rechercher l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
    }

    // Vérifier le mot de passe
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
    }

    // Générer un token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Renvoyer le token et les informations de l'utilisateur
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};

// Fonction pour obtenir le profil de l'utilisateur connecté
exports.getUserProfile = async (req, res) => {
  try {
    // Récupérer l'utilisateur depuis la requête (ajouté par le middleware d'authentification)
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
};

// Fonction pour changer le mot de passe de l'utilisateur
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Valider le nouveau mot de passe
    if (!passwordPattern.test(newPassword)) {
      return res.status(400).json({ message: 'Le nouveau mot de passe doit comporter au moins 12 caractères, incluant une majuscule, une minuscule, un chiffre et un caractère spécial.' });
    }

    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Vérifier si l'ancien mot de passe est correct
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect.' });
    }

    // Mettre à jour avec le nouveau mot de passe (haché)
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Mot de passe modifié avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur lors du changement de mot de passe.' });
  }
};
