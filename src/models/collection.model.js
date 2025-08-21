const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema({
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "App",          // trỏ sang App thay vì Owner
    required: true
  },
  collectionName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["data", "realtime"], // chỉ cho phép 2 loại
    required: true
  },
  createBy: String,
  createDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Collection", collectionSchema);
