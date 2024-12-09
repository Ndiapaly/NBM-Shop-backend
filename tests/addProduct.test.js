const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testAddProduct() {
  try {
    // Connexion pour obtenir le token
    console.log('Tentative de connexion...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'ndiapalyndiaye0201@gmail.com', // Email admin depuis .env
      password: 'password123' // Mot de passe admin par défaut
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Connexion réussie. Token obtenu :', loginResponse.data.token);
    const token = loginResponse.data.token;

    // Préparer les données du produit
    const formData = new FormData();
    formData.append('name', 'Test Sneaker');
    formData.append('description', 'Sneaker de test pour vérification');
    formData.append('price', 129.99);
    formData.append('category', 'homme');
    formData.append('brand', 'MNBM');
    
    // Ajouter les tailles
    const sizes = JSON.stringify([
      { size: 40, stock: 10 },
      { size: 41, stock: 15 },
      { size: 42, stock: 20 }
    ]);
    formData.append('sizes', sizes);

    // Ajouter une image de test
    const imagePath = path.join(__dirname, '../uploads/products/test-shoe.jpg');
    console.log('Chemin de l\'image :', imagePath);
    
    if (!fs.existsSync(imagePath)) {
      console.error('Fichier image non trouvé !');
      throw new Error('Image non trouvée');
    }

    formData.append('images', fs.createReadStream(imagePath), {
      filename: 'test-shoe.jpg',
      contentType: 'image/jpeg'
    });

    console.log('Envoi de la requête d\'ajout de produit...');

    // Faire la requête d'ajout de produit
    const response = await axios.post('http://localhost:5000/api/produits', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Produit ajouté avec succès :', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du produit :', 
      error.response ? JSON.stringify(error.response.data, null, 2) : error.message
    );
    if (error.response) {
      console.error('Status :', error.response.status);
      console.error('Headers :', error.response.headers);
    }
    throw error;
  }
}

// Exécuter le test
testAddProduct()
  .then(product => {
    console.log('Test terminé avec succès');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test échoué');
    process.exit(1);
  });
