const mongoose = require('mongoose');

const createCollection = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Collection name is required' });
    }
    mongoose.connection.createCollection(name + req.userId)
        .then(() => res.status(201).json({ message: 'Collection created successfully' }))
        .catch((error) => {
            console.error('Error creating collection:', error);
            res.status(500).json({ message: 'Internal server error' });
        });
}
const removeCollection = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Collection name is required' });
    }
    try {
        await mongoose.connection.dropCollection(name + req.body.userId);
        res.status(200).json({ message: 'Collection removed successfully' });
    } catch (error) {
        console.error('Error removing collection:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
module.exports = {
    createCollection, removeCollection,
};