const App = require("../../models/app.model");
const Collection = require("../../models/collection.model");

const createCollection = async (req, res) => {
    try {
        const { name, type } = req.body;
        const appId = req.headers["x-app-id"];
        const createBy = req.user._id;

        if (!name || !type) {
            return res.status(400).json({ message: "Name and type are required" });
        }

        const app = await App.findById(appId);
        if (!app) return res.status(404).json({ message: "App not found" });

        const exist = await Collection.findOne({ appId, collectionName: name });
        if (exist) return res.status(409).json({ message: "Collection already exists" });

        // 🚫 Không tạo collection vật lý, chỉ lưu metadata
        const newCollection = await Collection.create({
            appId,
            collectionName: name,
            createBy,
            type,
        });

        // Push ObjectId vào App.collections
        app.collections.push(newCollection._id);
        await app.save();

        res.status(201).json({
            message: "Collection created successfully",
            collection: newCollection,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error",
            error: err.message,
        });
    }
};

const removeCollection = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ message: "Collection ID is required" });

        const collection = await Collection.findById(id);
        if (!collection) return res.status(404).json({ message: "Collection not found" });

        // 🚫 Không xóa collection vật lý, chỉ xóa metadata
        await App.findByIdAndUpdate(collection.appId, {
            $pull: { collections: collection._id },
        });

        await Collection.findByIdAndDelete(id);

        res.status(200).json({ message: "Collection removed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error",
            error: err.message,
        });
    }
};

const updateCollection = async (req, res) => {
    try {
        const { id, name } = req.body;
        if (!id || !name) {
            return res.status(400).json({ message: "ID and new name are required" });
        }

        const collection = await Collection.findById(id);
        if (!collection) return res.status(404).json({ message: "Collection not found" });

        // Check trùng tên trong metadata
        const exists = await Collection.findOne({
            appId: collection.appId,
            collectionName: name,
            _id: { $ne: id },
        });
        if (exists) {
            return res.status(409).json({ message: "Target collection name already exists" });
        }

        // 🚫 Không rename collection vật lý, chỉ update metadata
        collection.collectionName = name;
        await collection.save();

        res.status(200).json({
            message: "Collection updated successfully",
            collection,
        });
    } catch (err) {
        console.error("Update collection error:", err);
        res.status(500).json({
            message: "Internal server error",
            error: err.message,
        });
    }
};

const fetchCollection = async (req, res) => {
    try {
        const appId = req.headers["x-app-id"];
        if (!appId) return res.status(400).json({ message: "App ID is required" });

        const collections = await Collection.find({ appId });
        res.status(200).json(collections);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error",
            error: err.message,
        });
    }
};

module.exports = {
    createCollection,
    removeCollection,
    fetchCollection,
    updateCollection,
};
