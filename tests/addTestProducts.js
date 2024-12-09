const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config({ path: '../.env' });

async function addTestProducts() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connexion à MongoDB réussie');

    // Supprimer les produits existants
    await Product.deleteMany({});
    console.log('Anciens produits supprimés');

    // Créer des produits de test
    const testProducts = [
      {
        name: 'Sneaker Classic',
        description: 'Sneaker confortable pour usage quotidien',
        price: 89.99,
        sizes: [
          { size: 40, stock: 10 },
          { size: 41, stock: 15 },
          { size: 42, stock: 20 }
        ],
        category: 'homme',
        brand: 'MNBM',
        images: ['/uploads/products/test-shoe.jpg']
      },
      {
        name: 'Running Pro',
        description: 'Chaussure de running performante',
        price: 129.99,
        sizes: [
          { size: 39, stock: 5 },
          { size: 40, stock: 12 },
          { size: 41, stock: 18 }
        ],
        category: 'sport',
        brand: 'MNBM',
        images: ['/uploads/products/test-shoe.jpg']
      }
    ];

    // Insérer les produits
    const insertedProducts = await Product.insertMany(testProducts);
    console.log('Produits de test ajoutés avec succès :', insertedProducts);

    // Fermer la connexion
    await mongoose.connection.close();
  } catch (error) {
    console.error('Erreur lors de l\'ajout des produits de test :', error);
    process.exit(1);
  }
}

// Exécuter le script
addTestProducts();
