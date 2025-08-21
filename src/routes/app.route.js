const express = require('express');
const appController = require('../controllers/app/app.controller');
const {authMiddleware} = require('../middlewares/auth.middleware');
const {saveRule, getRule} = require("../controllers/app/rule.controller")
const router = express.Router();

router.post('/createNewOwnerApp', authMiddleware, appController.createApp);
router.post('/removeOwnerApp', authMiddleware, appController.removeApp);
router.get('/fetchOwnerApps', authMiddleware, appController.getApps);

router.post('/saveRule',authMiddleware, saveRule);
router.get('/getRule', authMiddleware, getRule);
module.exports = router;