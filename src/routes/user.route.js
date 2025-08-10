const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');


router.get('/me', authMiddleware, (req, res) => {
    const { _id, email, createdAt, updatedAt } = req.user;
    res.json({
        user: { id: _id, email, createdAt, updatedAt }
    });
});

router.get('/profile', authMiddleware, (req, res) => {
    const { _id, email, createdAt, updatedAt } = req.user;
    res.json({
        user: { id: _id, email, createdAt, updatedAt }
    });
});

module.exports = router;