// controllers/document.controller.js
const { v4: uuidv4 } = require("uuid");
const Collection = require("../../models/collection.model");
const Document = require("../../models/document.model"); // Model chung

// 📌 CREATE Document
const createDocument = async (req, res) => {
  try {
    const appId = req.headers["x-app-id"];
    const collectionId = req.headers["x-collection-id"];
    let documentName = req.body.documentName;
    const data = req.body.data;

    if (!documentName) {
      documentName = uuidv4();
    }

    // Kiểm tra collection có tồn tại không
    const collection = await Collection.findOne({ _id: collectionId, appId });
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    // Kiểm tra document đã tồn tại chưa
    const exist = await Document.findOne({ 
      _id: documentName, 
      appId, 
      collectionId 
    });
    if (exist) {
      return res.status(409).json({ message: "Document with this ID already exists" });
    }

    // _id chính là documentName (giống Firestore)
    const newDoc = await Document.create({
      _id: documentName,
      collectionId,
      appId,
      data,
    });

    res.status(201).json({ message: "Document created", id: newDoc._id });
  } catch (error) {
    console.error("Create document error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 READ Document (lấy tất cả docs trong collection)
const getDocument = async (req, res) => {
  try {
    const { "x-app-id": appId, "x-collection-id": collectionId } = req.headers;

    const collection = await Collection.findOne({ _id: collectionId, appId });
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const docs = await Document.find({ appId, collectionId });
    res.json(docs);
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 UPDATE Document (update một số field trong data)
const updateDocument = async (req, res) => {
  try {
    const { "x-app-id": appId, "x-collection-id": collectionId, "x-document-id": documentName } = req.headers;

    const collection = await Collection.findOne({ _id: collectionId, appId });
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    // build updates
    const updates = {};
    for (const [key, value] of Object.entries(req.body.data)) {
      updates[`data.${key}`] = value;
    }

    const updated = await Document.findOneAndUpdate(
      { _id: documentName, appId, collectionId },
      { $set: updates },
      { new: true }
    );

    res.json({ message: "Document updated", document: updated });
  } catch (error) {
    console.error("Update document error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 SET Document (ghi đè toàn bộ data)
const setDocument = async (req, res) => {
  try {
    const { "x-app-id": appId, "x-collection-id": collectionId, "x-document-id": documentName } = req.headers;
    const data = req.body.data || {};

    const collection = await Collection.findOne({ _id: collectionId, appId });
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const updated = await Document.findOneAndUpdate(
      { _id: documentName, appId, collectionId },
      { data },
      { new: true, upsert: true }
    );

    res.json({ message: "Document set", document: updated });
  } catch (error) {
    console.error("Set document error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 REMOVE field trong document
const removeField = async (req, res) => {
  try {
    const { "x-app-id": appId, "x-collection-id": collectionId, "x-document-id": documentName } = req.headers;
    const { field } = req.body;

    if (!field) return res.status(400).json({ error: "Field name required" });

    const collection = await Collection.findOne({ _id: collectionId, appId });
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const updated = await Document.findOneAndUpdate(
      { _id: documentName, appId, collectionId },
      { $unset: { [`data.${field}`]: "" } },
      { new: true }
    );

    res.json({ message: `Field '${field}' removed`, document: updated });
  } catch (err) {
    console.error("Remove field error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 📌 DELETE Document
const deleteDocument = async (req, res) => {
  try {
    const { "x-app-id": appId, "x-collection-id": collectionId, "x-document-id": documentName } = req.headers;

    const collection = await Collection.findOne({ _id: collectionId, appId });
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    await Document.findOneAndDelete({ _id: documentName, appId, collectionId });

    res.json({ message: "Document deleted" });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  setDocument,
  removeField,
};
