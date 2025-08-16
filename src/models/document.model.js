const mongoose = require('mongoose');

// Schema cho document trong collection động
const documentSchema = new mongoose.Schema(
  {
    _id: { type: String }, // documentName từ frontend
    ownerId: {type: String, require: true},
    appId: { type: String, required: true },
    collectionId: {type: String, require: true},
    data: { type: Map, of: mongoose.Schema.Types.Mixed } // key-value linh hoạt (có thể là String, Number...)
  },
  { timestamps: true }
);

// Hàm tạo model động theo tên collection
const getDynamicModel = (collectionName) => {
  // Tránh lỗi OverwriteModelError khi gọi nhiều lần
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }
  return mongoose.model(collectionName, documentSchema, collectionName);
};

module.exports = getDynamicModel;
