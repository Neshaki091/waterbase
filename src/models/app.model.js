const mongoose = require("mongoose");

const appSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Owner",        // trỏ sang model Owners
    required: true
  },
  name: {
    type: String,
    required: true
  },
  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collection"    // trỏ sang model Collections
  }],
  createDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("App", appSchema);
