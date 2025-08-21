const {
    createCollection,
    removeCollection,
    fetchCollection,
    updateCollection,
} = require('../controllers/database/collection.controller');

const {
    createDocument,
    deleteDocument,
    getDocument,
    updateDocument,
} = require('../controllers/database/document.controller');

const { authMiddleware, authEndUser } = require('../middlewares/auth.middleware');
const rule = require('../middlewares/rule.middleware');

const router = require('express').Router();

/* =====================
   Owner routes (chỉ owner quản lý collection)
===================== */
router.post('/owner/create-collection', authMiddleware, createCollection);
router.delete('/owner/remove-collection', authMiddleware, removeCollection);
router.post('/owner/update-collection', authMiddleware, updateCollection);
router.get('/owner/fetch-collection', authMiddleware, fetchCollection);

// Owner thao tác document -> BỎ rule vì owner có toàn quyền
router.post('/owner/create-document', authMiddleware, createDocument);
router.delete('/owner/remove-document', authMiddleware, deleteDocument);
router.post('/owner/update-document', authMiddleware, updateDocument);
router.get('/owner/fetch-document', authMiddleware, getDocument);

/* =====================
   EndUser routes (bị check rule)
===================== */
router.post('/owner/create-collection', authEndUser, rule, createCollection);
router.delete('/owner/remove-collection', authEndUser, rule, removeCollection);
router.post('/owner/update-collection', authEndUser, rule, updateCollection);
router.get('/owner/fetch-collection', authEndUser, rule, fetchCollection);
// EndUser thao tác document -> PHẢI QUA rule middleware
router.post('/create-document', authEndUser, rule, createDocument);
router.delete('/remove-document', authEndUser, rule, deleteDocument);
router.post('/update-document', authEndUser, rule, updateDocument);
router.get('/fetch-document', authEndUser, rule, getDocument);

module.exports = router;
