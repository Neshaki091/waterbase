const express = require('express');
const router = express.Router();
const {authMiddleware, authEndUser} = require('../middlewares/auth.middleware');


router.get('/me', authMiddleware, (req, res) => {
    const { _id, email, createdAt, updatedAt } = req.user;
    res.json({
        user: { id: _id, email, createdAt, updatedAt }
    });
});
// GET profile EndUser
router.get('/enduser/profile', authEndUser, (req, res) => {
    const { _id, email, role, createdAt, updatedAt, appId } = req.user;
    console.log(_id, email, role, createdAt, updatedAt, appId);
    res.json({
        user: { 
            id: _id, 
            email, 
            role,
            appId,
            createdAt, 
            updatedAt 
        }
    });
});


module.exports = router;