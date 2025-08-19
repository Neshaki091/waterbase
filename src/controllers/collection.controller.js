const mongoose = require('mongoose');
const App = require("../models/app.model");
const Collection = require("../models/collection.model");

const createCollection = async (req, res) => {
    try {
        const { name, type } = req.body;
        const appId = req.headers["x-app-id"];

        if (!name || !type) return res.status(400).json({ message: "Name and type are required" });

        const app = await App.findById(appId);
        if (!app) return res.status(404).json({ message: "App not found" });

        const exist = await Collection.findOne({ appId, collectionName: name });
        if (exist) return res.status(409).json({ message: "Collection already exists" });

        // Tạo collection vật lý
        await mongoose.connection.createCollection(`${appId}_${name}`);

        // Tạo document metadata
        const newCollection = await Collection.create({ appId, collectionName: name, type });

        // Push ObjectId vào App.collections
        app.collections.push(newCollection._id);
        await app.save();

        res.status(201).json({ message: "Collection created successfully", collection: newCollection });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

const removeCollection = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ message: "Collection ID is required" });

        const collection = await Collection.findById(id);
        if (!collection) return res.status(404).json({ message: "Collection not found" });

        // Xóa collection vật lý
        await mongoose.connection.dropCollection(`${collection.appId}_${collection.collectionName}`);

        // Xóa ObjectId khỏi App.collections
        await App.findByIdAndUpdate(collection.appId, {
            $pull: { collections: collection._id }
        });

        // Xóa metadata
        await Collection.findByIdAndDelete(id);

        res.status(200).json({ message: "Collection removed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};
const updateCollection = async (req, res) => {
    try {
        const { id, name } = req.body;
        if (!id || !name) return res.status(400).json({ message: "ID and new name are required" });

        const collection = await Collection.findById(id);
        if (!collection) return res.status(404).json({ message: "Collection not found" });

        const oldName = `${collection.appId}_${collection.collectionName}`;
        const newName = `${collection.appId}_${name}`;

        // Check trùng tên
        const exists = await mongoose.connection.db.listCollections({ name: newName }).next();
        if (exists) {
            return res.status(409).json({ message: "Target collection name already exists" });
        }

        // Rename collection vật lý
        await mongoose.connection.db.collection(oldName).rename(newName);

        // Xóa model cũ trong cache nếu có
        delete mongoose.connection.models[oldName];

        // Cập nhật metadata
        collection.collectionName = name;
        await collection.save();

        res.status(200).json({ message: "Collection updated successfully", collection });
    } catch (err) {
        console.error("Update collection error:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
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
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

module.exports = {
    createCollection,
    removeCollection,
    fetchCollection,
    updateCollection,
};
