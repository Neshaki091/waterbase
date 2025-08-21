// controllers/rule.controller.js
const Rule = require("../../models/rule.model");

// Tạo hoặc ghi đè rule cho app
exports.saveRule = async (req, res) => {
  try {
    const appId = req.headers['x-app-id'];
    const { code } = req.body; // toàn bộ rule kiểu Firebase-style
    const ownerId = req.user.id;
    console.log("appID: ",appId)
    console.log("code: ",code)
    if (!code) return res.status(400).json({ message: "Rule code is required" });

    // Kiểm tra xem app đã có rule chưa
    let rule = await Rule.findOne({ appId, createdBy: ownerId });
    
    if (rule) {
      // Cập nhật
      rule.code = code;
      await rule.save();
      return res.json({ message: "Rule updated", rule });
    }

    // Tạo mới
    rule = await Rule.create({
      appId,
      code,
      createdBy: ownerId
    });

    res.json({ message: "Rule created", rule });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy rule của app
exports.getRule = async (req, res) => {
  try {
    const appId = req.headers["x-app-id"];
    const ownerId = req.user.id;
    console.log("appID: ",appId)
    console.log("ownerID: ",appId)
    const rule = await Rule.findOne({ appId, createdBy: ownerId });
    if (!rule) return res.status(404).json({ message: "Rule not found" });

    res.json(rule.code);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
