// models/document.model.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // documentName
  appId: { type: String, required: true },
  collectionId: { type: String, required: true },
  data: { type: Map, of: mongoose.Schema.Types.Mixed },
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Document', documentSchema); // 1 collection duy nhất
