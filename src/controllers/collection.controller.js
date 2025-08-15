const mongoose = require('mongoose');
const getTenantModel = require('../utils/tenant.util');
const user = require("../models/user.model")

async function createAppCollection({ name }) {

    mongoose.connection.createCollection(`${name}`)
        .then()
        .catch((error) => {
            console.error('Error creating collection:', error);
        });
}
async function removeAppCollection(name) {
    try {
        await mongoose.connection.dropCollection(`${name}`);
    }
    catch (error) {
        console.error('Error removing collection:', error);
    }
}

const createCollection = async (req, res) => {
    const name = req.body.name;
    const appId = req.headers["x-app-id"];
    const ownerId = req.headers["x-owner-id"];

    console.log('create: ', appId);
    console.log('create: ', name, 'for user:', req.user._id, 'with role:', req.user.role); // Assuming appId is stored in the user object

    const ownerModel = require("../models/user.model");
    const owner = await ownerModel.findById(ownerId);

    if (!owner) { return res.status(404).json({ message: "owner is not exist" }) };

    const app = owner.apps.find(a => a._id.toString() === appId);
    if (!app) { return res.status(400).json({ message: "App is not exist" }) };


    if (!name) {
        return res.status(400).json({ message: 'Collection name is required' });
    }
    const haveCollection = app?.collection;
    if (!haveCollection) {
        await user.findByIdAndUpdate(req.user._id, {
            $push: { apps: { collection: { name: `${appId}_${name}` } } }
        });
    } else {
        const isNameExist = haveCollection?.find(a => a.name.toString().split("_")[1] == name);
        if (isNameExist) {
            return res.status(407).json({ message: "collection is exist" })
        };
        await user.findByIdAndUpdate(
            req.user._id,
            { $push: { "apps.$[app].collection": { name: `${appId}_${name}` } } },
            { arrayFilters: [{ "app._id": appId }] }
        );

    }

    mongoose.connection.createCollection(`${appId}_${name}`)
        .then(() =>

            res.status(201).json({ message: 'Collection created successfully' }))
        .catch((error) => {
            console.error('Error creating collection:', error);
            res.status(500).json({ message: 'Internal server error' });
        });
}
const removeCollection = async (req, res) => {
    try {
        const name = req.body.name; // 
        const appId = req.headers["x-app-id"];
        const ownerId = req.headers["x-owner-id"];
        console.log (name);
        if (!name) {
            return res.status(400).json({ message: 'Collection name is required' });
        }
        if (!appId || !ownerId) {
            return res.status(400).json({ message: 'App ID and Owner ID are required' });
        }

        // 1️⃣ Xóa collection vật lý trong Mongo
        await mongoose.connection.dropCollection(`${appId}_${name}`);

        // 2️⃣ Xóa reference trong owner.apps[].collection
        await user.updateOne(
            { _id: ownerId, "apps._id": appId },
            { $pull: { "apps.$.collection": { name: `${appId}_${name}` } } }
        );

        res.status(200).json({ message: 'Collection removed successfully' });

    } catch (error) {
        console.error('Error removing collection:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const fetchCollection = async (req, res) => {
  try {
    const appId = req.headers["x-app-id"];
    const ownerId = req.headers["x-owner-id"];

    if (!ownerId || !appId) {
      return res.status(400).json({ message: "x-owner-id and x-app-id are required" });
    }

    const ownerModel = require("../models/user.model");
    const owner = await ownerModel.findById(ownerId);

    if (!owner) {
      return res.status(404).json({ message: "Owner does not exist" });
    }

    const app = owner.apps.find(a => a._id.toString() === appId);
    if (!app) {
      return res.status(404).json({ message: "App does not exist" });
    }

    return res.json(app.collection || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
    createAppCollection,
    createCollection, removeCollection, removeAppCollection, fetchCollection,
};