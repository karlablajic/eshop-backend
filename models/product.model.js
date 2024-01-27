const mongoose = require('mongoose');
const ProductSchema = mongoose.Schema({
    name: {
      type: String,
      required: [true, "Name can't be blank"]
    },
    description: {
      type: String,
      required: [true, "Description can't be blank"]
    },
    price: {
      type: String,
      required: [true, "Price can't be blank"]
    },
    category: {
      type: String,
      required: [true, "Category can't be blank"]
    },
    pictures: {
      type: Array,
      required: [true, "Pictures are required"]
    }
  }, { minimize: false });
  

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
