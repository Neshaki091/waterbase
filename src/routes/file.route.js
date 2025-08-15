const { createCollection, removeCollection,fetchCollection } = require('../controllers/collection.controller');
const { createDocument, removeDocument } = require('../controllers/document.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = require('express').Router();

router.post('/create-collection', authMiddleware, createCollection);
router.post('/remove-collection', authMiddleware, removeCollection);
router.post('/create-document', authMiddleware, createDocument);
router.post('/remove-document', authMiddleware, removeDocument);
router.get('/fetch-collection', authMiddleware, fetchCollection);
module.exports = router;