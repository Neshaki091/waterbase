const express = require('express');
const appController = require('../controllers/app.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

router.post('/createNewOwnerApp', authMiddleware, appController.createApp);
router.post('/removeOwnerApp', authMiddleware, appController.removeApp);
router.get('/fetchOwnerApps', authMiddleware, appController.getApps);
module.exports = router;