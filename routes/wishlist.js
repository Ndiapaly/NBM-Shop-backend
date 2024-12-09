const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Ajouter un produit à la wishlist
router.post('/add', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    console.log('Wishlist Add Request:', { 
      userId: req.user.id, 
      productId, 
      requestBody: req.body 
    });

    // Validate productId
    if (!productId) {
      return res.status(400).json({ 
        message: 'ProductId est requis', 
        details: 'Le corps de la requête doit contenir un productId' 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        message: 'Utilisateur non trouvé', 
        details: 'Impossible de trouver l\'utilisateur avec l\'ID fourni' 
      });
    }

    // Vérifier si le produit est déjà dans la wishlist
    const isProductInWishlist = user.wishlist.some(item => item.toString() === productId);

    if (!isProductInWishlist) {
      user.wishlist.push(productId);
      await user.save();
      
      res.status(200).json({ 
        message: 'Produit ajouté à la wishlist', 
        wishlist: user.wishlist 
      });
    } else {
      res.status(400).json({ 
        message: 'Produit déjà dans la wishlist',
        details: 'Ce produit existe déjà dans votre liste de favoris' 
      });
    }
  } catch (error) {
    console.error('Erreur détaillée lors de l\'ajout à la wishlist :', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Erreur serveur lors de l\'ajout à la wishlist', 
      details: error.message 
    });
  }
});

// Supprimer un produit de la wishlist
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);

    user.wishlist = user.wishlist.filter(item => item.toString() !== productId);
    await user.save();

    res.status(200).json({ 
      message: 'Produit retiré de la wishlist', 
      wishlist: user.wishlist 
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la wishlist :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer la wishlist de l'utilisateur
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.status(200).json(user.wishlist);
  } catch (error) {
    console.error('Erreur lors de la récupération de la wishlist :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
