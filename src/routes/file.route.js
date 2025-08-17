const { createCollection, removeCollection, fetchCollection, updateCollection } = require('../controllers/collection.controller');
const {createDocument, deleteDocument, getDocument, updateDocument} = require('../controllers/document.controller');
const {authMiddleware, authEndUser} = require('../middlewares/auth.middleware');

const router = require('express').Router();
// collections manager routes
router.post('/create-collection', authMiddleware, createCollection);
router.post('/remove-collection', authMiddleware, removeCollection);
router.post('/update-collection', authMiddleware, updateCollection);
router.get('/fetch-collection', authMiddleware, fetchCollection);

// documents manager routes
router.post('/create-document', authMiddleware, createDocument);
router.post('/remove-document', authMiddleware, deleteDocument);
router.post('/update-document', authMiddleware, updateDocument);
router.get('/fetch-document', authMiddleware, getDocument);

//
router.get('/enduser/fetch-collection', authEndUser, fetchCollection);

router.post('/enduser/create-document', authEndUser, createDocument);
router.post('/enduser/remove-document', authEndUser, deleteDocument);
router.post('/enduser/update-document', authEndUser, updateDocument);
router.get('/enduser/fetch-document', authEndUser, getDocument);


module.exports = router;