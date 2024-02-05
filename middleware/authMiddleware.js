const jwt = require('jsonwebtoken');
const jwtSecret = '4715aed3c946f7b0a38e6b534a9583628d84e96d10fbc04700770d572af3dce43625dd'

// Middleware function to authenticate JWT token
const authenticateToken = (req, res, next) => {
    const token = req.cookies.jwt;
  
    if (token == null) {
        return res.status(401).send('Unauthorized: No token provided');
    }
  
    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).send('Forbidden: Invalid token');
        }
        req.user = user;
        next();
    });
    return;
  };

  module.exports = authenticateToken;
