const router = require('express').Router();
const Product = require('../models/product.model');
const User = require('../models/user.model');

router.get('/', async (req, res) => {
    try {
      const products = await Product.find().sort({ '_id': -1 });
  
      res.status(200).json(products);
    } catch (error) {
      res.status(400).send(error.message);
    }
  });
  
  router.post('/', async (req, res) => {
    try {
      const { name, description, price, category, images: pictures } = req.body;
  
      // Create a new product
      await Product.create({ name, description, price, category, pictures });
  
      // Retrieve all products after creating the new one
      const products = await Product.find();
  
      res.status(201).json(products);
    } catch (error) {
      res.status(400).send(error.message);
    }
  });
  
  router.patch('/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const { name, description, price, category, images: pictures } = req.body;
  
      // Update the product by ID
      await Product.findByIdAndUpdate(id, { name, description, price, category, pictures });
  
      // Retrieve all products after updating
      const products = await Product.find();
  
      res.status(200).json(products);
    } catch (error) {
      res.status(400).send(error.message);
    }
  });

  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;
  
    try {
      // Check if the user has admin privileges
      const user = await User.findById(user_id);
      if (!user || !user.isAdmin) {
        return res.status(401).json("You don't have permission");
      }
  
      // Delete the product by ID
      await Product.findByIdAndDelete(id);
  
      // Retrieve all products after deletion
      const products = await Product.find();
  
      res.status(200).json(products);
    } catch (error) {
      res.status(400).send(error.message);
    }
  });
  
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      // Retrieve the product by ID
      const product = await Product.findById(id);
  
      // Retrieve similar products based on category
      const similar = await Product.find({ category: product.category }).limit(5);
  
      res.status(200).json({ product, similar });
    } catch (error) {
      res.status(400).send(error.message);
    }
  });

  router.get('/category/:category', async (req, res) => {
    const { category } = req.params;
  
    try {
      // Define the sort order
      const sort = { '_id': -1 };
  
      // Determine the query based on the category
      const query = (category === 'all') ? {} : { category };
  
      // Retrieve products with the specified category and apply sorting
      const products = await Product.find(query).sort(sort);
  
      res.status(200).json(products);
    } catch (error) {
      res.status(400).send(error.message);
    }
  });

  router.post('/add-to-cart', async (req, res) => {
    const { userId, productId, price } = req.body;
  
    try {
      // Find the user by ID
      const user = await User.findById(userId);
  
      // Update the user's cart
      const userCart = user.cart;
      userCart[productId] = (userCart[productId] || 0) + 1;
      userCart.count += 1;
      userCart.total += Number(price);
  
      // Save the updated user with the modified cart
      user.cart = userCart;
      user.markModified('cart');
      await user.save();
  
      res.status(200).json(user);
    } catch (error) {
      res.status(400).send(error.message);
    }
  });
  
  router.post('/increase-cart', async (req, res) => {
    const { userId, productId, price } = req.body;
  
    try {
      // Find the user by ID
      const user = await User.findById(userId);
  
      // Update the user's cart
      const userCart = user.cart;
      userCart.total += Number(price);
      userCart.count += 1;
      userCart[productId] += 1;
  
      // Save the updated user with the modified cart
      user.cart = userCart;
      user.markModified('cart');
      await user.save();
  
      res.status(200).json(user);
    } catch (error) {
      res.status(400).send(error.message);
    }
  });

  router.post('/decrease-cart', async (req, res) => {
    const { userId, productId, price } = req.body;
  
    try {
      // Find the user by ID
      const user = await User.findById(userId);
  
      // Update the user's cart
      const userCart = user.cart;
      userCart.total -= Number(price);
      userCart.count -= 1;
      userCart[productId] = Math.max(0, userCart[productId] - 1); // Ensure the count doesn't go below zero
  
      // Save the updated user with the modified cart
      user.cart = userCart;
      user.markModified('cart');
      await user.save();
  
      res.status(200).json(user);
    } catch (error) {
      res.status(400).send(error.message);
    }
  });

  router.post('/remove-from-cart', async (req, res) => {
    const { userId, productId, price } = req.body;
  
    try {
      // Find the user by ID
      const user = await User.findById(userId);
  
      // Update the user's cart
      const userCart = user.cart;
      const productCount = userCart[productId] || 0;
      userCart.total -= productCount * Number(price);
      userCart.count -= productCount;
      delete userCart[productId];
  
      // Save the updated user with the modified cart
      user.cart = userCart;
      user.markModified('cart');
      await user.save();
  
      res.status(200).json(user);
    } catch (error) {
      res.status(400).send(error.message);
    }
  });

  module.exports = router;