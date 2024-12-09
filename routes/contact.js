const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Route pour envoyer un email de contact
router.post('/send-email', async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    // Envoi de l'email
    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: `Nouveau message de ${name} - MNBM-Shop`,
      text: `
        Nom: ${name}
        Email: ${email}
        Téléphone: ${phone || 'Non spécifié'}
        
        Message:
        ${message}
      `
    });

    res.status(200).json({ 
      message: 'Votre message a été envoyé avec succès !' 
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'envoi du message',
      error: error.toString()
    });
  }
});

module.exports = router;
