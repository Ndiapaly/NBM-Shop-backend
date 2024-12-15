const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

// Configuration du proxy
app.set("trust proxy", false); // Désactiver si pas de proxy ou inconnu

// Sécurité : Middleware Helmet
app.use(helmet());

// Limitation des requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite 100 requêtes par IP
  message: "Trop de requêtes, réessayez plus tard",
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: false, // Correspond à la configuration de Express
});
app.use(limiter);

// ... le reste de votre code reste inchangé ...

// Middleware pour le parsing du JSON et URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware CORS
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:10000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const wishlistRoutes = require("./routes/wishlist");
const contactRoutes = require("./routes/contact");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes); // Ajoutez cette ligne si elle n'existait pas
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/contact", contactRoutes);

// Exemple de route pour GET /api/products avec pagination
// Assurez-vous que ce code est dans votre fichier routes/products.js
// Si ce n'est pas le cas, créez ce fichier ou modifiez-le selon votre structure

// Middleware de débogage (optionnel, pour vérifier que les requêtes arrivent)
app.use((req, res, next) => {
  console.log(`[DEBUG] Requête reçue : ${req.method} ${req.path}`);
  console.log("Headers :", req.headers);
  console.log("Query :", req.query);
  next();
});

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connexion MongoDB réussie"))
  .catch((err) => console.error("❌ Erreur de connexion MongoDB:", err));

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Quelque chose s'est mal passé !");
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port http://localhost:${PORT}`);
});
