const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
