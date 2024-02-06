const express = require("express");
const cors = require("cors");
const app = express();
require("./connection");

const cookieParser = require("cookie-parser");
const authenticateToken = require("./middleware/authMiddleware");
const adminMiddleware = require("./middleware/adminMiddleware");

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

const User = require("./models/user.model");

const userRoutes = require("./routes/user.route");
const productRoutes = require("./routes/product.route");
const orderRoutes = require("./routes/order.route");
const imageRoutes = require("./routes/image.route");

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
  ],
  methods: ["GET", "POST", "PATCH", "DELETE"],
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/images", imageRoutes);

//middleware
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
app.use(authenticateToken);
app.use(adminMiddleware);

app.get("/", (req, res) => res.render("home"));

//cookies
app.get("/set-cookies", (req, res) => {
  //res.setHeader('Set-Cookie', 'newUser=true');

  res.cookie("newUser", false);
  res.cookie("isUser", true, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });

  res.send("you got the cookies");
});

app.get("/read-cookies", (req, res) => {
  const cookies = req.cookies;

  res.json(cookies);
});

const port = 9000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.set("socketio", io);
