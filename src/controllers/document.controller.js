// controllers/document.controller.js

const {v4 :uuidv4} = require("uuid")
const getDynamicModel = require("../models/document.model");

// 📌 CREATE Document
const createDocument = async (req, res) => {
  try {
    const collectionName = req.headers["x-collection-name"]; // lấy từ frontend
    const appId = req.headers["x-app-id"];
    const collectionId = req.headers["collection-id"];
    documentName = req.body.documentName;
    const data = req.body.data;

    if (!documentName) {
      documentName = uuidv4();
    }

    console.log("create doc for collection:", collectionName);

    if (!collectionName || !documentName) {
      return res.status(400).json({ message: "collectionName & documentName are required" });
    }

    const Model = getDynamicModel(collectionName);

    // ✅ Kiểm tra document đã tồn tại chưa
    const existingDoc = await Model.findById(documentName);
    if (existingDoc) {
      return res.status(409).json({ message: "Document with this ID already exists" });
    }

    // _id chính là documentName (giống Firestore)
    const newDoc = new Model({
      _id: documentName,
      collectionId: collectionId,
      appId: appId,
      data: data
    });

    await newDoc.save();

    res.status(201).json({ message: "Document created", id: documentName });
  } catch (error) {
    console.error("Create document error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 READ Document
const getDocument = async (req, res) => {
  try {
    const { collectionName, documentName } = req.headers;

    if (!collectionName || !documentName) {
      return res.status(400).json({ message: "collectionName & documentName are required" });
    }

    const Model = getDynamicModel(collectionName);
    const doc = await Model.findById(documentName);

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json(doc);
  } catch (error) {
    console.error("Get document error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 UPDATE Document
const updateDocument = async (req, res) => {
  try {
    const { collectionName, documentName } = req.headers;
    const data = req.body;

    if (!collectionName || !documentName) {
      return res.status(400).json({ message: "collectionName & documentName are required" });
    }

    const Model = getDynamicModel(collectionName);
    const updated = await Model.findByIdAndUpdate(documentName, data, { new: true, upsert: true });

    res.json({ message: "Document updated", document: updated });
  } catch (error) {
    console.error("Update document error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 DELETE Document
const deleteDocument = async (req, res) => {
  try {
    const { collectionName, documentName } = req.headers;

    if (!collectionName || !documentName) {
      return res.status(400).json({ message: "collectionName & documentName are required" });
    }

    const Model = getDynamicModel(collectionName);
    await Model.findByIdAndDelete(documentName);

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
};
