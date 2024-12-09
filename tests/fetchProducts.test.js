const axios = require('axios');
require('dotenv').config({ path: '../.env' });

async function testFetchProducts() {
  try {
    console.log('🔍 Test de récupération des produits');
    console.log('URL de base :', process.env.BACKEND_URL || 'http://localhost:5000');

    // Récupérer un token admin pour les requêtes
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'ndiapalyndiaye0201@gmail.com',
        password: 'password123'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const token = loginResponse.data.token;
      console.log('✅ Token obtenu :', token);

      // Test de récupération des produits
      const productsResponse = await axios.get('http://localhost:5000/api/produits', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📦 Réponse complète :', JSON.stringify(productsResponse.data, null, 2));

      // Validation des données
      if (!productsResponse.data.products) {
        throw new Error('Aucun produit trouvé');
      }

      const products = productsResponse.data.products;
      console.log(`🎉 ${products.length} produits récupérés`);

      // Vérification des champs des produits
      products.forEach(product => {
        console.log('Produit :', {
          id: product._id,
          name: product.name,
          price: product.price,
          category: product.category
        });

        if (!product.name) console.warn('⚠️ Produit sans nom');
        if (!product.price) console.warn('⚠️ Produit sans prix');
        if (!product.category) console.warn('⚠️ Produit sans catégorie');
      });

      console.log('✅ Test de récupération des produits terminé avec succès');
      process.exit(0);
    } catch (loginError) {
      console.error('❌ Erreur de connexion :', loginError.response ? loginError.response.data : loginError.message);
      console.error('Détails de l\'erreur :', loginError);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test :', error.message);
    console.error('Détails de l\'erreur :', error);
    process.exit(1);
  }
}

// Exécuter le test
testFetchProducts();
