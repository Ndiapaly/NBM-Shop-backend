const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config({ path: '../.env' });

const products = [
  // Running
  {
    name: 'Nike Air Zoom Pegasus 38',
    description: 'Chaussure de running légère et confortable pour performances optimales',
    price: 129.99,
    sizes: [
      { size: 40, stock: 50 },
      { size: 41, stock: 75 },
      { size: 42, stock: 100 },
      { size: 43, stock: 60 }
    ],
    category: 'running',
    images: [
      'https://example.com/nike-pegasus-1.jpg',
      'https://example.com/nike-pegasus-2.jpg'
    ],
    brand: 'Nike',
    rating: 4.5,
    numReviews: 120
  },
  {
    name: 'Adidas Ultraboost 21',
    description: 'Chaussure de running avec technologie de retour d\'énergie',
    price: 179.99,
    sizes: [
      { size: 40, stock: 40 },
      { size: 41, stock: 65 },
      { size: 42, stock: 90 },
      { size: 43, stock: 55 }
    ],
    category: 'running',
    images: [
      'https://example.com/adidas-ultraboost-1.jpg',
      'https://example.com/adidas-ultraboost-2.jpg'
    ],
    brand: 'Adidas',
    rating: 4.7,
    numReviews: 200
  },

  // Basketball
  {
    name: 'Air Jordan XXXV',
    description: 'Chaussure de basketball haut de gamme pour performances professionnelles',
    price: 189.99,
    sizes: [
      { size: 40, stock: 30 },
      { size: 41, stock: 45 },
      { size: 42, stock: 60 },
      { size: 43, stock: 40 }
    ],
    category: 'basketball',
    images: [
      'https://example.com/jordan-xxxv-1.jpg',
      'https://example.com/jordan-xxxv-2.jpg'
    ],
    brand: 'Jordan',
    rating: 4.6,
    numReviews: 90
  },
  {
    name: 'Under Armour Curry 8',
    description: 'Chaussure de basketball signature de Stephen Curry',
    price: 159.99,
    sizes: [
      { size: 40, stock: 35 },
      { size: 41, stock: 50 },
      { size: 42, stock: 70 },
      { size: 43, stock: 45 }
    ],
    category: 'basketball',
    images: [
      'https://example.com/curry-8-1.jpg',
      'https://example.com/curry-8-2.jpg'
    ],
    brand: 'Under Armour',
    rating: 4.4,
    numReviews: 75
  },

  // Football
  {
    name: 'Nike Mercurial Vapor 14',
    description: 'Crampons légers pour vitesse et précision sur le terrain',
    price: 249.99,
    sizes: [
      { size: 40, stock: 25 },
      { size: 41, stock: 40 },
      { size: 42, stock: 55 },
      { size: 43, stock: 35 }
    ],
    category: 'football',
    images: [
      'https://example.com/mercurial-vapor-1.jpg',
      'https://example.com/mercurial-vapor-2.jpg'
    ],
    brand: 'Nike',
    rating: 4.8,
    numReviews: 150
  },
  {
    name: 'Adidas Predator Freak',
    description: 'Chaussures de football avec technologie de contrôle avancée',
    price: 279.99,
    sizes: [
      { size: 40, stock: 20 },
      { size: 41, stock: 35 },
      { size: 42, stock: 50 },
      { size: 43, stock: 30 }
    ],
    category: 'football',
    images: [
      'https://example.com/predator-freak-1.jpg',
      'https://example.com/predator-freak-2.jpg'
    ],
    brand: 'Adidas',
    rating: 4.7,
    numReviews: 110
  },

  // Casual
  {
    name: 'Nike Air Force 1',
    description: 'Sneakers iconiques pour un style urbain et confortable',
    price: 109.99,
    sizes: [
      { size: 40, stock: 80 },
      { size: 41, stock: 120 },
      { size: 42, stock: 150 },
      { size: 43, stock: 100 }
    ],
    category: 'casual',
    images: [
      'https://example.com/air-force-1.jpg',
      'https://example.com/air-force-2.jpg'
    ],
    brand: 'Nike',
    rating: 4.9,
    numReviews: 500
  },
  {
    name: 'Converse Chuck Taylor All Star',
    description: 'Baskets classiques intemporelles',
    price: 69.99,
    sizes: [
      { size: 40, stock: 90 },
      { size: 41, stock: 130 },
      { size: 42, stock: 160 },
      { size: 43, stock: 110 }
    ],
    category: 'casual',
    images: [
      'https://example.com/chuck-taylor-1.jpg',
      'https://example.com/chuck-taylor-2.jpg'
    ],
    brand: 'Converse',
    rating: 4.7,
    numReviews: 350
  },

  // Training
  {
    name: 'Nike Metcon 7',
    description: 'Chaussures de training polyvalentes pour crossfit et musculation',
    price: 129.99,
    sizes: [
      { size: 40, stock: 45 },
      { size: 41, stock: 70 },
      { size: 42, stock: 90 },
      { size: 43, stock: 55 }
    ],
    category: 'training',
    images: [
      'https://example.com/metcon-7-1.jpg',
      'https://example.com/metcon-7-2.jpg'
    ],
    brand: 'Nike',
    rating: 4.6,
    numReviews: 200
  },
  {
    name: 'Reebok Nano X1',
    description: 'Chaussures de training robustes avec stabilité maximale',
    price: 139.99,
    sizes: [
      { size: 40, stock: 40 },
      { size: 41, stock: 65 },
      { size: 42, stock: 85 },
      { size: 43, stock: 50 }
    ],
    category: 'training',
    images: [
      'https://example.com/nano-x1-1.jpg',
      'https://example.com/nano-x1-2.jpg'
    ],
    brand: 'Reebok',
    rating: 4.5,
    numReviews: 180
  },

  // Hiking
  {
    name: 'Salomon X Ultra 3 Mid GTX',
    description: 'Chaussures de randonnée imperméables et robustes',
    price: 159.99,
    sizes: [
      { size: 40, stock: 30 },
      { size: 41, stock: 50 },
      { size: 42, stock: 70 },
      { size: 43, stock: 40 }
    ],
    category: 'hiking',
    images: [
      'https://example.com/salomon-ultra-1.jpg',
      'https://example.com/salomon-ultra-2.jpg'
    ],
    brand: 'Salomon',
    rating: 4.7,
    numReviews: 220
  },
  {
    name: 'The North Face Ultra 111 WP',
    description: 'Chaussures de randonnée hautes performances',
    price: 179.99,
    sizes: [
      { size: 40, stock: 25 },
      { size: 41, stock: 45 },
      { size: 42, stock: 65 },
      { size: 43, stock: 35 }
    ],
    category: 'hiking',
    images: [
      'https://example.com/north-face-ultra-1.jpg',
      'https://example.com/north-face-ultra-2.jpg'
    ],
    brand: 'The North Face',
    rating: 4.6,
    numReviews: 190
  }
];

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connexion à MongoDB réussie');
  
  try {
    // Supprimer les produits existants
    await Product.deleteMany({});
    console.log('Anciens produits supprimés');

    // Insérer les nouveaux produits
    const insertedProducts = await Product.insertMany(products);
    console.log(`${insertedProducts.length} produits insérés avec succès`);
  } catch (error) {
    console.error('Erreur lors de l\'insertion des produits:', error);
  } finally {
    mongoose.connection.close();
  }
})
.catch(err => {
  console.error('Erreur de connexion à MongoDB:', err);
});
