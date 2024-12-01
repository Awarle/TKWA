const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Printer = require('../models/Printer');
const transporter = require('../services/emailService');

// Fonction pour changer le mot de passe d'un utilisateur (authentifié)
exports.changeUserPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Valider le nouveau mot de passe
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!passwordPattern.test(newPassword)) {
      return res.status(400).json({
        message:
          'Le nouveau mot de passe doit comporter au moins 12 caractères, incluant une majuscule, une minuscule, un chiffre et un caractère spécial.',
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Ancien mot de passe incorrect.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Mot de passe utilisateur mis à jour avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du changement de mot de passe utilisateur.' });
  }
};

// Fonction pour changer le mot de passe d'une imprimerie (authentifiée)
exports.changePrinterPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Valider le nouveau mot de passe
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!passwordPattern.test(newPassword)) {
      return res.status(400).json({
        message:
          'Le nouveau mot de passe doit comporter au moins 12 caractères, incluant une majuscule, une minuscule, un chiffre et un caractère spécial.',
      });
    }

    const printer = await Printer.findById(req.user.id);

    if (!printer) {
      return res.status(404).json({ message: 'Imprimerie non trouvée.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, printer.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Ancien mot de passe incorrect.' });
    }

    printer.password = await bcrypt.hash(newPassword, 10);
    await printer.save();

    res.status(200).json({ message: 'Mot de passe imprimante mis à jour avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du changement de mot de passe imprimante.' });
  }
};

// Fonction pour demander la réinitialisation du mot de passe (mot de passe oublié)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Rechercher l'utilisateur ou l'imprimerie par e-mail
    let user = await User.findOne({ email });
    let userType = 'Utilisateur';

    if (!user) {
      user = await Printer.findOne({ email });
      userType = 'Imprimerie';
    }

    if (!user) {
      return res.status(404).json({ message: 'Aucun compte associé à cet e-mail.' });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 heure

    // Stocker le token et son expiration dans l'utilisateur
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Envoyer l'e-mail avec le lien de réinitialisation
    const resetURL = `http://localhost:3000/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      text: `Vous recevez cet e-mail parce que vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte ${userType}.\n\nCliquez sur le lien suivant pour réinitialiser votre mot de passe :\n\n${resetURL}\n\nSi vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.\n`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'E-mail de réinitialisation envoyé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la demande de réinitialisation du mot de passe.' });
  }
};

// Fonction pour réinitialiser le mot de passe avec le token
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Valider le nouveau mot de passe
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!passwordPattern.test(newPassword)) {
      return res.status(400).json({
        message:
          'Le nouveau mot de passe doit comporter au moins 12 caractères, incluant une majuscule, une minuscule, un chiffre et un caractère spécial.',
      });
    }

    // Rechercher l'utilisateur ou l'imprimerie avec le token valide
    let user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    let userType = 'Utilisateur';

    if (!user) {
      user = await Printer.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });
      userType = 'Imprimerie';
    }

    if (!user) {
      return res.status(400).json({ message: 'Token invalide ou expiré.' });
    }

    // Mettre à jour le mot de passe
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe.' });
  }
};
