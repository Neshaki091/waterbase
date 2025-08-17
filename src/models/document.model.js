const mongoose = require('mongoose');

// Schema cho document trong collection động
const documentSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // documentName từ frontend
    appId: { type: String, required: true },
    collectionId: { type: String, required: true },
    data: { type: Map, of: mongoose.Schema.Types.Mixed }, // key-value linh hoạt
  },
  { 
    timestamps: true,   // tự động thêm createdAt, updatedAt
    versionKey: false   // bỏ __v
  }
);

// Hàm tạo model động theo tên collection
const getDynamicModel = (collectionName) => {
  if (!collectionName) {
    throw new Error("collectionName is required");
  }

  // Chuẩn hóa tên collection để tránh lỗi
  const normalizedName = collectionName.trim().replace(/\s+/g, "_");

  // Tránh lỗi OverwriteModelError khi gọi nhiều lần
  if (mongoose.models[normalizedName]) {
    return mongoose.models[normalizedName];
  }

  return mongoose.model(normalizedName, documentSchema, normalizedName);
};

module.exports = getDynamicModel;
