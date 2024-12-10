const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('Bienvenue sur l\'API!');
});
// Configuration du proxy
app.set('trust proxy', true);  // Ajouter cette ligne pour gérer correctement les en-têtes proxy

// Sécurité : Middleware Helmet
app.use(helmet());

// Limitation des requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite 100 requêtes par IP
  message: 'Trop de requêtes, réessayez plus tard',
  standardHeaders: true, 
  legacyHeaders: false,
  trustProxy: false // Désactiver le trust proxy pour le rate limiter
});
app.use(limiter);

// Middleware de débogage
app.use((req, res, next) => {
  console.log(`[DEBUG] Requête reçue : ${req.method} ${req.path}`);
  console.log('Headers :', req.headers);
  console.log('Body :', req.body);
  next();
});

// Middleware de débogage des routes
app.use((req, res, next) => {
  console.log(`[ROUTE DEBUG] Requête reçue : ${req.method} ${req.path}`);
  console.log('Headers :', req.headers);
  console.log('Body :', req.body);
  console.log('Query :', req.query);
  
  // Liste des routes enregistrées
  const routes = app._router.stack
    .filter(r => r.route)
    .map(r => `${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`);
  
  console.log('Routes disponibles :', routes);
  
  next();
});

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'https://locallhost:10000'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const wishlistRoutes = require('./routes/wishlist');
const contactRoutes = require('./routes/contact');  

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/contact', contactRoutes);  
app.use('/api/produits', productRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Afficher toutes les routes au démarrage
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(`Route: ${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`);
  }
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ Connexion MongoDB réussie'))
.catch((err) => console.error('❌ Erreur de connexion MongoDB:', err));

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Quelque chose s\'est mal passé !');
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
