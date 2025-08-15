const mongoose = require('mongoose');

const createDocument = async (req, res) => {
  try {
    const { collection, data, docId } = req.body;
    const appId = req.headers['x-app-id'];

    if (!collection || !data) {
      return res.status(400).json({ message: 'Collection name and data are required' });
    }

    // Tên collection cho multi-tenant
    const collectionName = `${appId}_${collection}`;
    const db = mongoose.connection;

    // Nếu muốn đảm bảo tồn tại collection, có thể check trước:
    const collections = await db.db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      console.log(`Collection "${collectionName}" chưa tồn tại → sẽ tạo mới khi insert.`);
    }

    const Model = db.collection(collectionName);

    // Nếu có docId → set _id, nếu không MongoDB sẽ tự sinh ObjectId
    if (docId) {
      data._id = docId;
    }

    // Thêm metadata giống Firestore
    data._createdAt = new Date();
    data._updatedAt = new Date();

    // Thêm document (MongoDB sẽ tự tạo collection nếu chưa có)
    const result = await Model.insertOne(data);

    return res.status(201).json({
      message: 'Document created successfully',
      documentId: result.insertedId
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to create document', error });
  }
};

const removeDocument = async (req, res) => {
    const { documentName } = req.body;
    if (!documentName) {
        return res.status(400).json({ message: 'document name is required' });
    }
    try {
        await mongoose.connection.dropDocument(documentName);
        res.status(200).json({ message: 'Document removed successfully' });
    }
    catch (error) {
        console.error('Error removing document:', error);
        res.status(500).json({ message: 'Internal server error' });
    }   
};
module.exports = {
    createDocument, removeDocument,
};