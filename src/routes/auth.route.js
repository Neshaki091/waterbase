const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();
const { register, login, refreshToken, logout } = authController;

router.post('/register', (req, res) => {
  console.log('Register endpoint hit');
  register(req, res); // gọi hàm đúng cách
});
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

module.exports = router;
