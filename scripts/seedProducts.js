const mongoose = require('mongoose');
const path = require('path');
const Product = require('../models/Product');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('MongoDB URI:', MONGODB_URI);

const testProducts = [
  {
    name: 'Nike Air Max 270',
    description: 'Chaussure Nike Air Max 270 pour homme',
    price: 15000,
    sizes: [
      { size: 40, stock: 10 },
      { size: 41, stock: 15 },
      { size: 42, stock: 20 }
    ],
    category: 'running',
    brand: 'nike',
    images: [
      'https://example.com/nike-air-max-270-1.jpg',
      'https://example.com/nike-air-max-270-2.jpg'
    ]
  },
  {
    name: 'Adidas Ultraboost 22',
    description: 'Chaussure de running Adidas Ultraboost 22',
    price: 18000,
    sizes: [
      { size: 39, stock: 12 },
      { size: 40, stock: 18 },
      { size: 41, stock: 25 }
    ],
    category: 'running',
    brand: 'adidas',
    images: [
      'https://example.com/adidas-ultraboost-22-1.jpg',
      'https://example.com/adidas-ultraboost-22-2.jpg'
    ]
  }
];

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connexion MongoDB réussie');
  
  // Supprimer les produits existants
  await Product.deleteMany({});
  
  // Insérer les nouveaux produits
  await Product.insertMany(testProducts);
  
  console.log('Produits de test ajoutés avec succès');
  mongoose.connection.close();
})
.catch((err) => {
  console.error('Erreur lors de l\'ajout des produits :', err);
  mongoose.connection.close();
});
