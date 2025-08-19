// controllers/document.controller.js

const { v4: uuidv4 } = require("uuid")
const getDynamicModel = require("../models/document.model");
const Collection = require("../models/collection.model");

// 📌 CREATE Document
const createDocument = async (req, res) => {
  try {
    const appId = req.headers["x-app-id"];
    const collectionId = req.headers["x-collection-id"];
    documentName = req.body.documentName;
    const data = req.body.data;

    if (!documentName) {
      documentName = uuidv4();
    }
    const collection = await Collection.findOne({ _id: collectionId, appId });
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }
    const collectionName = appId + "_" + collection.collectionName;

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
  console.log("🔥 getDocument called");
  try {
    const collectionId = req.headers["x-collection-id"];
    const appId = req.headers["x-app-id"];
    // Kiểm tra collection có tồn tại trong app không
    const collection = await Collection.findOne({ _id: collectionId, appId });
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const collectionName = appId + "_" + collection.collectionName;

    if (!collectionName) {
      return res.status(400).json({ message: "collectionName is required" });
    }

    // Lấy model động theo tên collection
    const Model = getDynamicModel(collectionName);

    // Lấy tất cả documents trong collection
    const docs = await Model.find({});
    return res.json(docs);

  } catch (error) {
    console.error("Get documents error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// 📌 UPDATE Document
// 🔹 update(): chỉ cập nhật field trong req.body.data
const updateDocument = async (req, res) => {
  console.log("🔥 updateDocument called");
  try {
    const collectionId = req.headers["x-collection-id"];
    const documentName = req.headers["x-document-id"];
    const appId = req.headers["x-app-id"];

    const collection = await Collection.findOne({ _id: collectionId, appId });
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }
    const collectionName = appId + "_" + collection.collectionName;
    if (!collectionName || !documentName) {
      return res.status(400).json({ message: "collectionId & documentId are required" });
    }

    const Model = getDynamicModel(collectionName);

    // build updates
    const updates = {};
    for (const [key, value] of Object.entries(req.body.data)) {
      updates[`data.${key}`] = value;
    }

    const updated = await Model.findByIdAndUpdate(
      documentName,
      { $set: updates }, // chỉ set các key trong data
      { new: true }
    );

    res.json({ message: "Document updated", document: updated });
  } catch (error) {
    console.error("Update document error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔹 set(): ghi đè toàn bộ document
const setDocument = async (req, res) => {
  console.log("🔥 setDocument called");
  try {
    const collectionId = req.headers["x-collection-id"];
    const documentName = req.headers["x-document-id"];
    const appId = req.headers["x-app-id"];
    const data = req.body.data || {};

    const collection = await Collection.findOne({ _id: collectionId, appId });
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }
    const collectionName = appId + "_" + collection.collectionName;
    if (!collectionName || !documentName) {
      return res.status(400).json({ message: "collectionId & documentId are required" });
    }

    const Model = getDynamicModel(collectionName);

    // overwrite toàn bộ document
    const updated = await Model.findByIdAndUpdate(
      documentName,
      { data },  // ghi đè luôn object data
      { new: true, upsert: true }
    );

    res.json({ message: "Document set", document: updated });
  } catch (error) {
    console.error("Set document error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE field trong document
// 📌 DELETE field trong document
const removeField = async (req, res) => {
  try {
    const collectionId = req.headers["x-collection-id"];
    const documentName = req.headers["x-document-id"];
    const appId = req.headers["x-app-id"];
    const { field } = req.body; // field cần xóa trong data

    if (!field) return res.status(400).json({ error: "Field name required" });

    // Kiểm tra collection thuộc app
    const collection = await Collection.findOne({ _id: collectionId, appId });
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const collectionName = appId + "_" + collection.collectionName;
    const Model = getDynamicModel(collectionName);

    // unset field trong data
    const updated = await Model.findByIdAndUpdate(
      documentName,
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
    const collectionId = req.headers["x-collection-id"];
    const documentName = req.headers["x-document-id"];
    const appId = req.headers["x-app-id"];
    const collection = await Collection.findOne({ _id: collectionId, appId });
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }
    const collectionName = appId + "_" + collection.collectionName;
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
  setDocument,
  removeField,
};
