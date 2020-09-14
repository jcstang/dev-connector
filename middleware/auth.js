const jwt = require('jsonwebtoken');
const config = require('config');

// middleware function
module.exports = function (req, res, next) {
  // 1. get token from header
  // header key we want to send the token in
  const token = req.header('x-auth-token');

  // 2. check if not token
  if (!token) {
    return res.status(401).json({
      status: 401,
      msg: 'no token, authorization denied.',
    });
  }

  // 3. verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
