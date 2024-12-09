const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  orderItems: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
    size: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          const validCountries = [
            'France', 'Sénégal', 'Belgique', 'Suisse', 'Canada', 
            'États-Unis', 'Maroc', 'Côte d\'Ivoire', 'Guinée', 
            'Mali', 'Burkina Faso', 'Togo', 'Bénin', 
            'Cameroun', 'Gabon', 'Congo', 'Allemagne', 
            'Royaume-Uni', 'Espagne', 'Italie', 'Pays-Bas'
          ];
          return validCountries.includes(v);
        },
        message: props => `${props.value} n'est pas un pays valide!`
      }
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} n'est pas un email valide!`
      }
    },
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          // Récupérer le pays depuis le document parent
          const country = this.parent().shippingAddress.country;
          
          // Mapping des codes pays et regex
          const phoneValidation = {
            'France': { regex: /^(\+33)[1-9]\d{8}$/, code: '+33' },
            'Sénégal': { regex: /^(\+221)[7-8]\d{8}$/, code: '+221' },
            'Belgique': { regex: /^(\+32)[4-9]\d{8}$/, code: '+32' },
            'Suisse': { regex: /^(\+41)[7-9]\d{8}$/, code: '+41' },
            'Canada': { regex: /^(\+1)[2-9]\d{9}$/, code: '+1' },
            'États-Unis': { regex: /^(\+1)[2-9]\d{9}$/, code: '+1' },
            'Maroc': { regex: /^(\+212)[6-7]\d{8}$/, code: '+212' },
            'Côte d\'Ivoire': { regex: /^(\+225)\d{9}$/, code: '+225' },
            'Guinée': { regex: /^(\+224)\d{8}$/, code: '+224' },
            'Mali': { regex: /^(\+223)\d{8}$/, code: '+223' },
            'Burkina Faso': { regex: /^(\+226)\d{8}$/, code: '+226' },
            'Togo': { regex: /^(\+228)\d{8}$/, code: '+228' },
            'Bénin': { regex: /^(\+229)\d{8}$/, code: '+229' },
            'Cameroun': { regex: /^(\+237)\d{8}$/, code: '+237' },
            'Gabon': { regex: /^(\+241)\d{8}$/, code: '+241' },
            'Congo': { regex: /^(\+242)\d{8}$/, code: '+242' },
            'Allemagne': { regex: /^(\+49)[1-9]\d{9}$/, code: '+49' },
            'Royaume-Uni': { regex: /^(\+44)[7-9]\d{9}$/, code: '+44' },
            'Espagne': { regex: /^(\+34)[6-7]\d{8}$/, code: '+34' },
            'Italie': { regex: /^(\+39)\d{9}$/, code: '+39' },
            'Pays-Bas': { regex: /^(\+31)[6]\d{8}$/, code: '+31' }
          };

          // Si pas de pays spécifié, utiliser Sénégal par défaut
          const countryConfig = phoneValidation[country] || phoneValidation['Sénégal'];

          // Nettoyer le numéro de téléphone
          const cleanedPhone = v.replace(/[\s\-()]/g, '');
          
          // Ajouter le code pays si absent
          const phoneWithCode = cleanedPhone.startsWith('+') 
            ? cleanedPhone 
            : (countryConfig.code + cleanedPhone);

          // Valider avec le regex du pays
          return countryConfig.regex.test(phoneWithCode);
        },
        message: props => `${props.value} n'est pas un numéro de téléphone valide pour le pays`
      }
    },
    phoneCode: {
      type: String,
      required: true,
      enum: [
        '+33', '+221', '+32', '+41', '+1', 
        '+212', '+225', '+224', '+223', '+226', 
        '+228', '+229', '+237', '+241', '+242', 
        '+49', '+44', '+34', '+39', '+31'
      ]
    },
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['tigocash', 'wave', 'orange-money', 'a la livraison'],
    validate: {
      validator: function(v) {
        return ['tigocash', 'wave', 'orange-money', 'a la livraison'].includes(v);
      },
      message: props => `${props.value} n'est pas une méthode de paiement valide`
    }
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'En attente'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
