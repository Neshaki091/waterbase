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

const router = express.Router();

// Register
router.post('/register/owner', registerOwner);
router.post('/register/user', registerEndUser);

// Login
router.post('/login/owner', ownerLogin);
router.post('/login/user', endUserLogin);

// Token & logout
router.post('/refresh', refreshToken);
router.post('/logout', logout);

module.exports = router;
