const user = require('../models/user.model');

const { createAppCollection, removeAppCollection } = require('../controllers/collection.controller');

const createApp = async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const ownerId = req.headers["x-owner-id"];
        const { name } = req.body;
        const ownerModel = require("../models/user.model");
        const owner = await ownerModel.findById(ownerId);
        const app = owner.apps.find(a => a.name.toString().split('_')[0] === name);

        if (app) { return res.status(404).json({ message: "Have another app used this name" }) };
        if (!name) {
            return res.status(400).json({ message: 'App name is required' });
        }
        await createAppCollection({ name: name + req.user._id });

        await user.findByIdAndUpdate(req.user._id, {
            $push: { apps: { name: name + '_' + req.user._id } }
        });
        console.log('New app created:', name);

        res.status(201).json({ message: 'App created successfully' });
    } catch (err) {
        console.error('Create app error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}
const removeApp = async (req, res) => {
    console.log('Removing app for user:', req.user._id, 'with role:', req.user.role);
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const { appId } = req.body;
        if (!appId) {
            return res.status(400).json({ message: 'App ID is required' });
        }
        const app = await user.findOneAndUpdate(
            { _id: req.user._id, 'apps.appId': appId },
            { $pull: { apps: { name: name + "_" + req.user._id, } } },
            { new: true }
        );
        if (!app) {
            return res.status(404).json({ message: 'App not found' });
        }
        await removeAppCollection({ appID: req.user._id });
        res.status(200).json({ message: 'App removed successfully' });
    }
    catch (err) {
        console.error('Remove app error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getApps = async (req, res) => {
    try {
        const dbUser = await user.findById(req.user._id).select('apps');
        if (!dbUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(dbUser.apps); // trả mảng apps luôn
    } catch (error) {
        console.error('Get app error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
module.exports = {
    createApp, removeApp, getApps,
};