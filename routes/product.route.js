const router = require('express').Router();
const Product = require('../models/product.model');
const User = require('../models/user.model');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', authenticateToken, async (res) => {
  try {
      // Fetch products only if the user is authenticated
      // Use req.user to get user information from the token
      const products = await Product.find().sort({ '_id': -1 });

      // Respond with the products
      res.status(200).json(products);
  } catch (error) {
      // Handle errors
      res.status(400).send(error.message);
  }
});

  
router.post('/', authenticateToken, async (req, res) => {
  try {
      // Check if the user is an admin
      if (req.user.role !== 'admin') {
          return res.status(403).send('Forbidden: You are not authorized to perform this action');
      }

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

  
router.patch('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
      // Check if the user is an admin
      if (req.user.role !== 'admin') {
          return res.status(403).send('Forbidden: You are not authorized to perform this action');
      }

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


router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
      // Check if the user is an admin
      if (req.user.role !== 'admin') {
          return res.status(403).send('Forbidden: You are not authorized to perform this action');
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

  router.get('/category/:category', authenticateToken, async (req, res) => {
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


router.post('/add-to-cart', authenticateToken, async (req, res) => {
  const { userId, productId, price } = req.body;

  try {
      // Ensure that the user is a regular user
      if (req.user.role !== 'regular') {
          return res.status(403).send('Forbidden: You are not authorized to perform this action');
      }

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

  
  router.post('/increase-cart', authenticateToken, async (req, res) => {
    const { userId, productId, price } = req.body;

    try {
        // Ensure that the user is a regular user
        if (req.user.role !== 'regular') {
            return res.status(403).send('Forbidden: You are not authorized to perform this action');
        }

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


  router.post('/decrease-cart', authenticateToken, async (req, res) => {
    const { userId, productId, price } = req.body;

    try {
        // Ensure that the user is a regular user
        if (req.user.role !== 'regular') {
            return res.status(403).send('Forbidden: You are not authorized to perform this action');
        }

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


router.post('/remove-from-cart', authenticateToken, async (req, res) => {
  const { userId, productId, price } = req.body;

  try {
      // Ensure that the user is a regular user
      if (req.user.role !== 'regular') {
          return res.status(403).send('Forbidden: You are not authorized to perform this action');
      }

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
