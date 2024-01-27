const express = require('express');
const cors = require('cors');
const app = express();
require('./connection');

const cookieParser = require('cookie-parser');
const { requireAuth } = require('./middleware/authMiddleware');
const authRoutes = require('./routes/user.route');

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: 'http://localhost:3001', methods: ['GET', 'POST', 'PATCH', 'DELETE'] },
});

const User = require('./models/user.model');

const userRoutes = require('./routes/user.route');
const productRoutes = require('./routes/product.route');
const orderRoutes = require('./routes/order.route');
const imageRoutes = require('./routes/image.route');
const { checkUser } = require('./middleware/authMiddleware');

const corsOptions = {
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/images', imageRoutes);

//middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

app.get('*', checkUser);
app.get('/', (req, res) => res.render('home'));
app.get('/eshop', requireAuth, (req, res)=> res.render('eshop'));
app.use(authRoutes);

//cookies
app.get('/set-cookies', (req, res) =>{

  //res.setHeader('Set-Cookie', 'newUser=true');

  res.cookie('newUser', false);
  res.cookie('isCustomer', true, {maxAge: 1000 * 60 * 60 * 24, httpOnly: true });

  res.send('you got the cookies');

});

app.get('/read-cookies', (req, res)=> {
   const cookies = req.cookies;
   console.log(cookies.newUser);

   res.json(cookies);

});

/*app.post('/create-payment', async(req, res)=> {
  const {amount} = req.body;
  console.log(amount);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card']
    });
    res.status(200).json(paymentIntent)
  } catch (e) {
    console.log(e.message);
    res.status(400).json(e.message);
   }
})
*/
const port = 9000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//app.set('socketio', io);