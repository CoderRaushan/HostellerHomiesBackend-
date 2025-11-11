const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

exports.generateToken = (Id,email,role) => {
  return jwt.sign({ Id,email,role }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
  