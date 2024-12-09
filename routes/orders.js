const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const stripe = require('stripe');
const dotenv = require('dotenv');

dotenv.config();

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Configuration de l'email avec gestion des erreurs améliorée
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Configuration TLS pour plus de sécurité
  tls: {
    rejectUnauthorized: false // À remplacer par true en production
  }
});

// Fonction de vérification de la connexion email
const verifyEmailTransport = async () => {
  try {
    await transporter.verify();
    console.log('✅ Connexion email réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion email:', error);
  }
};

// Vérifier la connexion email au démarrage
verifyEmailTransport();

// Fonction d'envoi d'email sécurisée
const sendOrderEmail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email envoyé:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    // Ne pas lever d'erreur pour ne pas bloquer la création de commande
    return null;
  }
};

// Mapping des pays et codes téléphoniques
const countryPhoneCodes = {
  'France': '+33',
  'Sénégal': '+221', 
  'Belgique': '+32', 
  'Suisse': '+41', 
  'Canada': '+1', 
  'États-Unis': '+1', 
  'Maroc': '+212', 
  'Côte d\'Ivoire': '+225', 
  'Guinée': '+224', 
  'Mali': '+223', 
  'Burkina Faso': '+226', 
  'Togo': '+228', 
  'Bénin': '+229', 
  'Cameroun': '+237', 
  'Gabon': '+241', 
  'Congo': '+242', 
  'Allemagne': '+49', 
  'Royaume-Uni': '+44', 
  'Espagne': '+34', 
  'Italie': '+39', 
  'Pays-Bas': '+31'
};

// Validation et préparation de l'adresse de livraison
const validateShippingAddress = (shippingAddress) => {
  // Vérifier que tous les champs requis sont présents
  if (!shippingAddress || 
      !shippingAddress.fullName || 
      !shippingAddress.address || 
      !shippingAddress.city || 
      !shippingAddress.postalCode ||
      !shippingAddress.phoneNumber
  ) {
    throw new Error('Adresse de livraison incomplète');
  }

  // Pays par défaut si non spécifié
  shippingAddress.country = shippingAddress.country || 'Sénégal';

  // Ajouter le code pays si non présent
  shippingAddress.phoneCode = shippingAddress.phoneCode || 
    countryPhoneCodes[shippingAddress.country] || 
    '+221';

  // Nettoyer et formater le numéro de téléphone
  const cleanedPhone = shippingAddress.phoneNumber
    .replace(/[\s\-()]/g, '')
    .replace(/^0/, '');

  // Ajouter le code pays si non présent
  shippingAddress.phoneNumber = shippingAddress.phoneNumber.startsWith('+') 
    ? shippingAddress.phoneNumber 
    : (shippingAddress.phoneCode + cleanedPhone);

  return shippingAddress;
};

// @route   POST api/orders
// @desc    Create a new order
router.post('/', auth, async (req, res) => {
  try {
    const { 
      orderItems, 
      shippingAddress, 
      paymentMethod, 
      totalPrice 
    } = req.body;

    // Validation et préparation de l'adresse
    const validatedShippingAddress = validateShippingAddress(shippingAddress);

    // Validation détaillée
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ 
        message: 'Aucun article dans la commande',
        details: 'La liste des articles est vide ou manquante' 
      });
    }

    // Validation de l'adresse de livraison
    if (!validatedShippingAddress.fullName || !validatedShippingAddress.phoneNumber) {
      return res.status(400).json({ 
        message: 'Informations de livraison incomplètes',
        details: 'Nom complet ou numéro de téléphone manquant' 
      });
    }

    // Validation de la méthode de paiement
    const validPaymentMethods = ['tigocash', 'wave', 'orange-money', 'payment-at-delivery'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ 
        message: 'Méthode de paiement invalide',
        details: `Méthodes valides : ${validPaymentMethods.join(', ')}` 
      });
    }

    // Liste des pays valides
    const validCountries = [
      'France', 'Sénégal', 'Belgique', 'Suisse', 'Canada', 
      'États-Unis', 'Maroc', 'Côte d\'Ivoire', 'Guinée', 
      'Mali', 'Burkina Faso', 'Togo', 'Bénin', 
      'Cameroun', 'Gabon', 'Congo', 'Allemagne', 
      'Royaume-Uni', 'Espagne', 'Italie', 'Pays-Bas'
    ];

    // Validation du pays
    if (!validatedShippingAddress.country || !validCountries.includes(validatedShippingAddress.country)) {
      return res.status(400).json({ message: 'Pays invalide' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(validatedShippingAddress.email)) {
      return res.status(400).json({ message: 'Adresse email invalide' });
    }

    // Validate order items
    for (const item of orderItems) {
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ message: 'ID de produit invalide' });
      }
      if (typeof item.size !== 'number' || isNaN(item.size)) {
        return res.status(400).json({ message: 'Taille invalide' });
      }
      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        return res.status(400).json({ message: 'Quantité invalide' });
      }
      if (typeof item.price !== 'number' || item.price < 0) {
        return res.status(400).json({ message: 'Prix invalide' });
      }
    }

    // Création de la commande
    const newOrder = new Order({
      orderItems, 
      shippingAddress: validatedShippingAddress, 
      paymentMethod, 
      totalPrice, 
      user: req.user.id
    });

    const createdOrder = await newOrder.save();
    
    // Envoi des emails
    try {
      // Email au client
      const customerMailOptions = {
        from: process.env.EMAIL_FROM,
        to: req.user.email,
        subject: 'Confirmation de votre commande - MNBM Shop',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Merci pour votre commande!</h1>
            <p>Votre commande #${createdOrder._id} a été confirmée.</p>
            <h2>Détails de la commande:</h2>
            <p><strong>Montant total:</strong> ${totalPrice}€</p>
            <p><strong>Mode de paiement:</strong> ${paymentMethod}</p>
            <h3>Articles commandés:</h3>
            <ul>
              ${orderItems.map(item => `
                <li>Taille: ${item.size} - Quantité: ${item.quantity} - Prix: ${item.price}€</li>
              `).join('')}
            </ul>
            <h3>Adresse de livraison:</h3>
            <p>${validatedShippingAddress.fullName}<br>
            ${validatedShippingAddress.address}<br>
            ${validatedShippingAddress.city}, ${validatedShippingAddress.postalCode}<br>
            ${validatedShippingAddress.country}</p>
            <p>Nous vous tiendrons informé du statut de votre commande.</p>
          </div>
        `
      };
      await sendOrderEmail(customerMailOptions);

      // Email à l'admin
      const adminMailOptions = {
        from: process.env.EMAIL_FROM,
        to: process.env.ADMIN_EMAIL,
        subject: 'Nouvelle commande - MNBM Shop',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Nouvelle commande reçue!</h1>
            <p><strong>Commande ID:</strong> ${createdOrder._id}</p>
            <p><strong>Client:</strong> ${req.user.email}</p>
            <p><strong>Montant total:</strong> ${totalPrice}€</p>
            <p><strong>Mode de paiement:</strong> ${paymentMethod}</p>
            <h2>Détails de la commande:</h2>
            <h3>Articles commandés:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${await Promise.all(orderItems.map(async (item) => {
                const product = await Product.findById(item.product);
                const imageUrl = product.images[0].startsWith('http') 
                  ? product.images[0] 
                  : `http://localhost:3000${product.images[0]}`;
                return `
                  <tr style="border-bottom: 1px solid #ddd; padding: 10px;">
                    <td style="padding: 10px;">
                      <img src="${imageUrl}" alt="${product.name}" 
                           style="max-width: 100px; max-height: 100px; display: block; margin: 0 auto;">
                    </td>
                    <td style="padding: 10px;">
                      <p><strong>Produit:</strong> ${product.name}</p>
                      <p><strong>Taille:</strong> ${item.size}</p>
                      <p><strong>Quantité:</strong> ${item.quantity}</p>
                      <p><strong>Prix:</strong> ${item.price}€</p>
                    </td>
                  </tr>
                `;
              })).then(items => items.join(''))}
            </table>
            <h3>Adresse de livraison:</h3>
            <p>${validatedShippingAddress.fullName}<br>
            ${validatedShippingAddress.address}<br>
            ${validatedShippingAddress.city}, ${validatedShippingAddress.postalCode}<br>
            ${validatedShippingAddress.country}</p>
          </div>
        `
      };
      await sendOrderEmail(adminMailOptions);
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi des emails:', emailError);
      // Ne pas bloquer la création de commande en cas d'erreur email
    }

    res.status(201).json(createdOrder);

  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    
    res.status(500).json({ 
      message: 'Erreur lors de la création de la commande',
      error: error.message,
      details: error.stack
    });
  }
});

// @route   GET api/orders/me
// @desc    Get user orders
router.get('/me', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('orderItems.product')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des commandes',
      error: err.message 
    });
  }
});

// @route   GET api/orders/:id
// @desc    Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('orderItems.product')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Check if the order belongs to the user
    if (order.user._id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération de la commande',
      error: err.message 
    });
  }
});

// Route pour créer une intention de paiement
router.post('/:id/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Vérifier que l'utilisateur connecté est le propriétaire de la commande
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Créer une intention de paiement Stripe
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount, // Montant en centimes
      currency: 'eur',
      metadata: { 
        orderId: order._id.toString(),
        userId: req.user._id.toString() 
      }
    });

    res.status(200).json({ 
      clientSecret: paymentIntent.client_secret 
    });
  } catch (error) {
    console.error('Erreur de création de l\'intention de paiement:', error);
    res.status(500).json({ message: 'Erreur de traitement du paiement' });
  }
});

// Route pour confirmer le paiement
router.put('/:id/pay', auth, async (req, res) => {
  try {
    const { paymentResult } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Vérifier que l'utilisateur connecté est le propriétaire de la commande
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Mettre à jour l'état de la commande
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: paymentResult.id,
      status: paymentResult.status,
      update_time: paymentResult.created,
      email_address: req.user.email
    };

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Erreur de confirmation de paiement:', error);
    res.status(500).json({ message: 'Erreur de confirmation de paiement' });
  }
});

// Route de webhook Stripe (optionnel mais recommandé)
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripeClient.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        // Mettre à jour la commande
        await Order.findByIdAndUpdate(orderId, {
          isPaid: true,
          paidAt: Date.now(),
          paymentResult: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: paymentIntent.created,
          }
        });
        break;

      case 'payment_intent.payment_failed':
        // Gérer les paiements échoués si nécessaire
        console.log('Paiement échoué:', event.data.object);
        break;

      default:
        console.log(`Événement non géré : ${event.type}`);
    }

    res.status(200).send();
  } catch (err) {
    console.error('Erreur de webhook Stripe:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Nouvelle route pour récupérer les commandes de l'utilisateur
router.get('/user', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('_id totalPrice status createdAt');
    res.json(orders);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des commandes' });
  }
});

module.exports = router;
