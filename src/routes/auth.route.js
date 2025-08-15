// src/routes/auth.route.js
const express = require('express');
const {
  registerOwner,
  registerEndUser,
  ownerLogin,
  endUserLogin,
  refreshToken,
  logout
} = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Register
router.post('/register/owner', registerOwner);
router.post('/register/user',authMiddleware, registerEndUser);

// Login
router.post('/login/owner', ownerLogin);
router.post('/login/user',authMiddleware, endUserLogin);

// Token & logout
router.post('/refresh', refreshToken);
router.post('/logout', logout);

module.exports = router;
