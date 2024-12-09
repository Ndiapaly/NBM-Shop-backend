const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');

// @route   POST api/auth/register
// @desc    Register a new user
router.post('/register', [
  check('username', 'Nom d\'utilisateur requis').not().isEmpty(),
  check('email', 'Veuillez entrer un email valide').isEmail(),
  check('password', 'Le mot de passe doit contenir au moins 6 caractères').isLength({ min: 6 }),
  check('firstName', 'Prénom requis').not().isEmpty(),
  check('lastName', 'Nom requis').not().isEmpty()
], async (req, res) => {
  // Vérifier les erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, firstName, lastName } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    let userByUsername = await User.findOne({ username });
    let userByEmail = await User.findOne({ email });

    if (userByUsername) {
      return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà utilisé' });
    }

    if (userByEmail) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Créer un nouvel utilisateur
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName
    });

    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Enregistrer l'utilisateur
    await user.save();

    // Créer le payload pour le token JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    // Générer le token JWT
    jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }, 
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      }
    );
  } catch (err) {
    console.error('Erreur lors de l\'inscription :', err.message);
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', [
  check('email', 'Veuillez inclure un email valide').isEmail(),
  check('password', 'Le mot de passe est requis').exists()
], async (req, res) => {
  console.log('Tentative de connexion reçue:', req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Erreurs de validation:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    console.log('Utilisateur trouvé:', user);

    if (!user) {
      console.log('Aucun utilisateur trouvé avec cet email');
      return res.status(400).json({ msg: 'Identifiants invalides' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Mot de passe correct:', isMatch);

    if (!isMatch) {
      console.log('Mot de passe incorrect');
      return res.status(400).json({ msg: 'Identifiants invalides' });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          console.error('Erreur lors de la génération du token:', err);
          throw err;
        }
        console.log('Connexion réussie pour:', email);
        res.json({ 
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      }
    );
  } catch (err) {
    console.error('Erreur lors de la connexion:', err.message);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;
