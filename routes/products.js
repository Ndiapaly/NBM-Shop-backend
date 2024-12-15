const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuration de Multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/products");

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb(new Error("Only image files are allowed!"));
  },
});

// @route   POST /api/produits
// @desc    Créer un nouveau produit
// @access  Privé/Admin
router.post("/", [auth, admin, upload.array("images", 5)], async (req, res) => {
  try {
    console.log("Requête reçue pour créer un produit :", {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      sizes: req.body.sizes,
      category: req.body.category,
      brand: req.body.brand,
    });
    const { name, description, price, sizes, category, brand } = req.body;

    // Convertir les tailles de chaîne à un tableau d'objets
    const parsedSizes = JSON.parse(sizes || "[]").map((size) => ({
      size: size.size,
      stock: size.stock || 0,
    }));

    // Chemins des images uploadées
    const images = req.files.map(
      (file) => `/uploads/products/${file.filename}`
    );

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      sizes: parsedSizes,
      category,
      brand,
      images,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error);
    res.status(500).json({
      message: "Erreur lors de la création du produit",
      error: error.message,
    });
  }
});

// @route   GET /api/products
// @desc    Récupérer tous les produits
// @access  Public
router.get("/", async (req, res) => {
  try {
    console.log("Requête reçue pour récupérer tous les produits");
    const { page = 1, limit = 10, category, nouveaute, promotion } = req.query;

    console.log("Requête de récupération des produits :", {
      page,
      limit,
      category,
      nouveaute,
      promotion,
    });

    // Convertir les paramètres en nombres
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const query = {};

    // Filtres optionnels
    if (category) query.category = category;
    if (nouveaute === "true") query.nouveaute = true;
    if (promotion === "true") query.promotion = true;

    console.log("Requête MongoDB :", query);

    // Récupérer les produits avec pagination
    const products = await Product.find(query)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 });

    // Compter le nombre total de produits correspondant à la requête
    const total = await Product.countDocuments(query);

    console.log("Produits trouvés :", products);
    console.log("Total de produits :", total);

    // Vérifier si des produits ont été trouvés
    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "Aucun produit trouvé",
        products: [],
        totalPages: 0,
        currentPage: pageNum,
      });
    }

    // Calculer le nombre total de pages
    const totalPages = Math.max(1, Math.ceil(total / limitNum));

    // Réponse structurée
    res.json({
      products,
      totalPages,
      currentPage: pageNum,
      totalProducts: total,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des produits",
      error: error.message,
    });
  }
});
// @route   GET api/products
// @desc    Get all products
router.get("/all", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// @route   GET api/products/search
// @desc    Search products
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    console.log("Requête de recherche de produits :", { q });
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
      ],
    });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// @route   POST api/products
// @desc    Add a new product
router.post("/old", auth, async (req, res) => {
  try {
    const { name, description, price, sizes, category, brand, images } =
      req.body;

    const product = new Product({
      name,
      description,
      price,
      sizes: typeof sizes === "string" ? JSON.parse(sizes) : sizes,
      category,
      brand,
      images: typeof images === "string" ? JSON.parse(images) : images,
    });

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// @route   POST api/products/upload
// @desc    Upload product images
router.post("/upload", [auth, upload.array("images", 5)], async (req, res) => {
  try {
    const images = req.files.map((file) => `/uploads/${file.filename}`);
    res.json({ images });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// @route   GET api/products/:id
// @desc    Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Produit non trouvé" });
    }
    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Produit non trouvé" });
    }
    res.status(500).send("Erreur serveur");
  }
});

// @route   PUT api/products/:id
// @desc    Update product
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, description, price, sizes, category, brand, images } =
      req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: "Produit non trouvé" });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.sizes = sizes
      ? typeof sizes === "string"
        ? JSON.parse(sizes)
        : sizes
      : product.sizes;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.images = images
      ? typeof images === "string"
        ? JSON.parse(images)
        : images
      : product.images;

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// @route   DELETE api/products/:id
// @desc    Delete product
router.delete("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Produit non trouvé" });
    }
    await product.remove();
    res.json({ msg: "Produit supprimé" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Produit non trouvé" });
    }
    res.status(500).send("Erreur serveur");
  }
});

// @route   GET /api/products/category/:category
// @desc    Get products by category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;

    // Liste des catégories valides
    const validCategories = [
      "running",
      "basketball",
      "football",
      "casual",
      "training",
      "hiking",
    ];

    // Vérifier si la catégorie est valide
    if (!validCategories.includes(category.toLowerCase())) {
      return res.status(400).json({
        message: "Catégorie de produit invalide",
      });
    }

    // Rechercher les produits de la catégorie
    const products = await Product.find({
      category: category.toLowerCase(),
    }).select("-__v");

    // Si aucun produit trouvé
    if (products.length === 0) {
      return res.status(404).json({
        message: `Aucun produit trouvé dans la catégorie ${category}`,
      });
    }

    res.json(products);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des produits par catégorie:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des produits",
      error: error.message,
    });
  }
});

// Route de test
router.get("/test", async (req, res) => {
  try {
    console.log("Test route called");
    res.json({ message: "Test route is working" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

module.exports = router;
