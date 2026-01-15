const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.SECRETE_ACCESS_KEY, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
