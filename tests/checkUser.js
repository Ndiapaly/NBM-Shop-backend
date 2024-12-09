const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function checkUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connexion à MongoDB réussie');

    // Rechercher l'utilisateur
    const user = await User.findOne({ email: 'ndiapalyndiaye0201@gmail.com' });

    if (user) {
      console.log('Utilisateur trouvé :');
      console.log('ID:', user._id);
      console.log('Email:', user.email);
      console.log('Username:', user.username);
      console.log('Rôle:', user.role);
    } else {
      console.log('Aucun utilisateur trouvé avec cet email');
    }
  } catch (error) {
    console.error('Erreur :', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUser();
