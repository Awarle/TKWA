const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Printer = require('../models/Printer');

module.exports = async function (req, res, next) {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  if (!token) {
    return res.status(401).json({ message: 'Pas de token, autorisation refusée.' });
  }

  try {
    // Décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur ou l'imprimerie correspondant à l'ID décodé
    let user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user; // Définit req.user pour un utilisateur
      req.user.role = 'user';
      return next();
    }

    let printer = await Printer.findById(decoded.id).select('-password');
    if (printer) {
      req.user = printer; // Définit req.user pour une imprimerie
      req.user.role = 'printer';
      return next();
    }

    // Si aucun utilisateur ou imprimerie trouvé
    return res.status(401).json({ message: 'Token invalide ou entité non trouvée.' });
  } catch (error) {
    console.error('Erreur d\'authentification :', error);
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};
