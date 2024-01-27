const router = require('express').Router();
const Order = require('../models/order.model');
const User = require('../models/user.model');

router.post('/', async (req, res) => {
    const io = req.app.get('socketio');
    const { userId, cart, country, address } = req.body;
  
    try {
      // Find the user by ID
      const user = await User.findById(userId);
  
      // Create a new order
      const order = await Order.create({
        owner: user._id,
        products: cart,
        country,
        address,
        count: cart.count,
        total: cart.total,
      });
  
      // Update user's cart and orders
      user.cart = { total: 0, count: 0 };
      user.orders.push(order);
  
      // Save the updated user
      user.markModified('orders');
      await user.save();
  
      // Notify clients about the new order
      const notification = {
        status: 'unread',
        message: `New order from ${user.name}`,
        time: new Date(),
      };
      io.sockets.emit('new-order', notification);
  
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json(error.message);
    }
  });

  router.get('/', async (req, res) => {
    try {
      // Retrieve orders with owner's email and name populated
      const orders = await Order.find().populate('owner', ['email', 'name']);
  
      res.status(200).json(orders);
    } catch (error) {
      res.status(400).json(error.message);
    }
  });

  router.patch('/:id/mark-shipped', async (req, res) => {
    const io = req.app.get('socketio');
    const { ownerId } = req.body;
    const { id } = req.params;
  
    try {
      // Find the user by ID
      const user = await User.findById(ownerId);
  
      // Mark the order as shipped
      await Order.findByIdAndUpdate(id, { status: 'shipped' });
  
      // Retrieve updated orders with owner's email and name populated
      const orders = await Order.find().populate('owner', ['email', 'name']);
  
      // Notify the user and update notifications
      const notification = { status: 'unread', message: `Order ${id} shipped with success`, time: new Date() };
      io.sockets.emit("notification", notification, ownerId);
      user.notifications.push(notification);
      await user.save();
  
      res.status(200).json(orders);
    } catch (error) {
      res.status(400).json(error.message);
    }
  });

  module.exports = router;