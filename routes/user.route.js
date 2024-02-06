const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const authenticateToken = require("../middleware/authMiddleware");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminMiddleware = require("../middleware/adminMiddleware");
const jwtSecret =
  "4715aed3c946f7b0a38e6b534a9583628d84e96d10fbc04700770d572af3dce43625dd";

router.post("/signup", async (req, res) => {
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

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Authentication failed. User not found." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "Authentication failed. User not found." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      jwtSecret,
      { expiresIn: "1h" }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 3600000,
    });

    res.status(200).json({
      token: token,
      user,
    });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Authentication failed. User not found." });
  }
});

router.get("/", authenticateToken, adminMiddleware, async (req, res) => {
  try {
    // Query the database to find regular users
    const regularUsers = await User.find({ isAdmin: false }).populate("orders");

    // Return the list of regular users along with their orders
    res.json(regularUsers);
  } catch (error) {
    // Handle specific error cases
    if (error.name === "ValidationError") {
      // If it's a validation error, you can extract specific error messages
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({ errors: validationErrors });
    }

    res.status(500).send("Internal Server Error");
  }
});

// Route to get orders for a specific user
router.get("/:id/orders", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const foundUser = await User.findById(id).populate("orders");

    if (!foundUser) {
      return res.status(404).send("User not found");
    }

    res.json(foundUser.orders);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).send("Invalid user ID");
    }

    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
