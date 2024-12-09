const nodemailer = require('nodemailer');
require('dotenv').config();

const testEmailConfig = async () => {
  // Validation des variables d'environnement
  const requiredEnvVars = [
    'SMTP_HOST', 
    'EMAIL_USER', 
    'EMAIL_PASS', 
    'EMAIL_FROM', 
    'ADMIN_EMAIL'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Variables d\'environnement manquantes:', missingVars);
    return;
  }

  try {
    // Configuration du transporteur
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Vérifier la connexion
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie');

    // Validation de l'email de l'admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail || !adminEmail.includes('@')) {
      throw new Error('Email administrateur invalide');
    }

    // Envoyer un email de test
    const testMailOptions = {
      from: process.env.EMAIL_FROM,
      to: adminEmail,
      subject: 'Test de configuration email - MNBM Shop',
      text: `Test de configuration email\nDate du test : ${new Date().toLocaleString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Test de configuration email</h1>
          <p>La configuration email fonctionne correctement.</p>
          <p>Date du test : ${new Date().toLocaleString()}</p>
        </div>
      `
    };

    const info = await transporter.sendMail(testMailOptions);
    console.log('📧 Email de test envoyé avec succès');
    console.log('ID du message:', info.messageId);
    console.log('Destinataire:', adminEmail);
  } catch (error) {
    console.error('❌ Erreur de configuration email:', error);
    
    // Détails de débogage supplémentaires
    console.error('Détails de configuration:');
    console.error('SMTP Host:', process.env.SMTP_HOST);
    console.error('SMTP Port:', process.env.SMTP_PORT);
    console.error('Email User:', process.env.EMAIL_USER);
    console.error('Email From:', process.env.EMAIL_FROM);
    console.error('Admin Email:', process.env.ADMIN_EMAIL);
  }
};

testEmailConfig();
