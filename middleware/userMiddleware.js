const jwt = require("jsonwebtoken");
const jwtSecret =
  "4715aed3c946f7b0a38e6b534a9583628d84e96d10fbc04700770d572af3dce43625dd";

module.exports = (req, res, next) => {
  const user = req.user;
  try {
    if (!user.isAdmin) {
      next();
    } else {
      res.status(403).json({
        message: "Forbidden access!",
      });
    }
  } catch (error) {
    res.status(401).json({
      message: "admin authentication failed",
    });
  }
};
