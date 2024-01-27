const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if(token) {
        jwt.verify(token, 'eshop', async (err, decodedToken) => {
            if(err) {
                console.log(err.message);
                res.direct('/login');
            } else{
                console.log(decodedToken);
                next();
            }
        })
    }
    else {
        res.redirekt('/login')
    }
}



const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if(token) {
        jwt.verify(token, 'eshop', async (err, decodedToken) => {
            if(err) {
                console.log(err.message);
                res.locals.user = null;
                next();
            } else{
                console.log(decodedToken);
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        })
    }
    else {
        res.locals.user = null;
        next();
    }
}
module.exports = { requireAuth, checkUser};
