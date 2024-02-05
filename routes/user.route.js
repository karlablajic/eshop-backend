const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const authenticateToken = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = '4715aed3c946f7b0a38e6b534a9583628d84e96d10fbc04700770d572af3dce43625dd'



router.post('/signup', async (req, res) => {
  try {
      const { name, email, password } = req.body;
    
   
     const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
          name,
          email,
          password: hashedPassword,
      });

      const maxAge = 3 * 60 * 60; 

      const token = jwt.sign(
          { id: user._id, username: user.name, role: user.role },
          jwtSecret,
          {
              expiresIn: maxAge, 
          }
      );

      res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: maxAge * 1000,
      });


      res.status(201).json({
          message: "User successfully created",
          user: user._id,
          token: token,
      });
  } catch (error) {
      
      res.status(400).json({
          message: "User not successfully created",
          error: error.message,
      });
  }
});

      
      router.post('/login', async (req, res) => {
        try {
            const { email, password } = req.body;
    
            const user = await User.findOne({ email });
    
            if (!user) {
                return res.status(401).json({ message: "Authentication failed. User not found." });
            }
    
            const passwordMatch = await bcrypt.compare(password, user.password);
    
            if (!passwordMatch) {
                return res.status(401).json({ message: "Authentication failed. Invalid password." });
            }
    
            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role },
                jwtSecret,
                { expiresIn: '1h' } 
            );
    
            res.cookie('jwt', token, {
                httpOnly: true,
                maxAge: 3600000,
            });
    
    
            res.status(200).json({
                message: 'Authentication successful',
                token: token,
            });
        } catch (error) {
            
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
    
      
    
        /*try {
          // Use a meaningful function name for better readability
          const authenticatedUser = await User.authenticate(email, password);
          res.json(authenticatedUser);
        } catch (error) {
          // Handle specific error cases
          if (error.name === 'AuthenticationError') {
            return res.status(401).send('Invalid email or password');
          }}});
   */
      
          router.get('/', authenticateToken, async (req, res) => {
            try {
                // Ensure that the user is an admin
                if (req.user.role !== 'admin') {
                    return res.status(403).json({ message: 'Forbidden: You are not authorized to access this resource.' });
                }
        
                // Query the database to find regular users
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
        

// Route to get orders for a specific user
router.get('/:id/orders', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const foundUser = await User.findById(id).populate('orders');

        if (!foundUser) {
            return res.status(404).send('User not found');
        }

        // Check if the user has admin role
        if (req.user.role !== 'admin') {
            return res.status(403).send('Forbidden: You are not authorized to access this resource');
        }

        res.json(foundUser.orders);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).send('Invalid user ID');
        }

        res.status(500).send('Internal Server Error');
    }
});


    
 module.exports = router;
      


 
      


      
