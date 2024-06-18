const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {

    let token = req.headers['authorization'];
    // console.log("token", token);
    if(!token) {
        res.status(403).json({message: 'token required'});
    }
    token = token.substring(7);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch(err) {
        return res.status(401).json({message: 'Invalid token'});
    }
    return next();
};

module.exports = verifyToken;