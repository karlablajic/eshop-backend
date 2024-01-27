const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');


const maxAge = 3*24*60*60;
      const createToken = (id) => {
        return jwt.sign({ id }, 'eshop', {
          expiresIn
        })
      }
router.post('/signup', async(req, res)=> {
    const {name, email, password} = req.body;

    try {
        // Assuming 'name', 'email', and 'password' are variables containing user input
        const user = await User.create({ name, email, password });
        const token = createToken(user_.id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge*1000 * 60 * 60 * 24 });
        res.json({user: user_.id});

      } catch (error) {
        // Check if the error is a duplicate key violation (code 11000 for MongoDB)
        if (error.code === 11000) {
          return res.status(400).send('Email already exists');
        }
      
        // Handle other validation errors or unexpected errors
        if (error.name === 'ValidationError') {
          // If it's a validation error, you can extract specific error messages
          const validationErrors = Object.values(error.errors).map((err) => err.message);
          return res.status(400).json({ errors: validationErrors });
        }
      
        // For unexpected errors, send a generic error message
        res.status(500).send('Internal Server Error');
      }
    });

    router.post('/login', async (req, res) => {
        const { email, password } = req.body;
    
        try {
          // Use a meaningful function name for better readability
          const authenticatedUser = await User.authenticate(email, password);
          res.json(authenticatedUser);
        } catch (error) {
          // Handle specific error cases
          if (error.name === 'AuthenticationError') {
            return res.status(401).send('Invalid email or password');
          }}});
   
      
      router.get('/', async (req, res) => {
        try {
          // Use a more specific query and meaningful variable names for better readability
          const regularUsers = await User.find({ isAdmin: false }).populate('orders');
      
          // Return the list of regular users along with their orders
          res.json(regularUsers);
        } catch (error) {
          // Handle specific error cases
          if (error.name === 'ValidationError') {
            // If it's a validation error, you can extract specific error messages
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ errors: validationErrors });
          }
      
          // For unexpected errors, send a generic error message
          res.status(500).send('Internal Server Error');
        }
      });
      

      router.get('/:id/orders', async (req, res) => {
        const { id } = req.params;
      
        try {
          // Use meaningful variable names for better readability
          const foundUser = await User.findById(id).populate('orders');
      
          if (!foundUser) {
            return res.status(404).send('User not found');
          }
      
          // Return the orders associated with the user
          res.json(foundUser.orders);
        } catch (error) {
          // Handle specific error cases
          if (error.name === 'CastError') {
            return res.status(400).send('Invalid user ID');
          }
      
          // For unexpected errors, send a generic error message
          res.status(500).send('Internal Server Error');
        }
      });

    
      module.exports = router;
      


      
