const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  
  // Check if no token
  if (!authHeader) {
    return res.status(401).json({ msg: 'Pas de token, autorisation refusée' });
  }

  // Get token from Bearer format
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ msg: 'Format de token invalide' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token non valide' });
  }
};
