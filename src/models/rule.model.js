const mongoose = require("mongoose");

const ruleSchema = new mongoose.Schema({
  appId: { type: String, required: true }, // rule thuộc app nào
  code: { type: String, required: true },  // toàn bộ rule như Firebase-style (JS / DSL)
  createdBy: { type: String, required: true }, // ownerId
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// update updatedAt mỗi lần save
ruleSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Rule", ruleSchema);
