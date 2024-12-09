const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connexion à MongoDB réussie');

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: 'ndiapalyndiaye0201@gmail.com' });
    
    if (existingUser) {
      console.log('Utilisateur existe déjà');
      await mongoose.disconnect();
      return;
    }

    // Générer un sel
    const salt = await bcrypt.genSalt(10);
    
    // Créer un nouvel utilisateur admin
    const adminUser = new User({
      username: 'admin_ndiaye',
      email: 'ndiapalyndiaye0201@gmail.com',
      password: await bcrypt.hash('password123', salt),
      firstName: 'Ndiaye',
      lastName: 'Admin',
      role: 'admin'
    });

    // Sauvegarder l'utilisateur
    await adminUser.save();

    console.log('Utilisateur admin créé avec succès');
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur :', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdminUser();
