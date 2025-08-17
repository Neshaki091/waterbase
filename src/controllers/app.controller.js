const App = require("../models/app.model");
const Owner = require("../models/user.model");

/**
 * Tạo App mới (Owner)
 */
const createApp = async (req, res) => {
    try {
        if (!req.user._id) {
            return res.status(403).json({ message: "No owner id" });
        }

        if (req.user.role !== "owner") {
            return res.status(403).json({ message: "Permission denied" });
        }

        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "App name is required" });
        }

        // Kiểm tra trùng tên app cho owner
        const exists = await App.findOne({ ownerId: req.user._id, name });
        if (exists) {
            return res.status(400).json({ message: "App name already exists" });
        }

        // Tạo app mới
        const newApp = new App({
            ownerId: req.user._id,
            name: name,
        });
        await newApp.save();
        console.log(newApp.name);
        await Owner.findByIdAndUpdate(
            req.user._id,
            { $push: { apps: { _id: newApp._id, name: newApp.name } } },
            { new: true }
        );
        
        res.status(201).json({
            message: "App created successfully",
            app: newApp,
        });
    } catch (err) {
        console.error("Create app error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Xóa App
 */
const removeApp = async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ message: "Permission denied" });
        }

        const { appId } = req.body;
        if (!appId) {
            return res.status(400).json({ message: "App ID is required" });
        }

        const deletedApp = await App.findOneAndDelete({
            _id: appId,
            ownerId: req.user._id,
        });

        if (!deletedApp) {
            return res.status(404).json({ message: "App not found" });
        }

        res.status(200).json({ message: "App removed successfully" });
    } catch (err) {
        console.error("Remove app error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Lấy tất cả App của Owner
 */
const getApps = async (req, res) => {
  try {
    const owner = await Owner.findById(req.user._id).populate({path: "apps"});

    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }
    res.json({
      message: "Apps fetched successfully",
      apps: owner.apps,
    });
  } catch (error) {
    console.error("Get apps error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
    createApp,
    removeApp,
    getApps,
};
