const mongoose = require('mongoose');

async function createAppCollection({name}) {
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
    const name = req.body;
    console.log('create: ', name, 'for user:', req.user._id, 'with role:', req.user.role);
    const appID = req.user.appId; // Assuming appId is stored in the user object
    if (!name) {
        return res.status(400).json({ message: 'Collection name is required' });
    }
    mongoose.connection.createCollection(`${name}_${appID}`)
        .then(() => res.status(201).json({ message: 'Collection created successfully' }))
        .catch((error) => {
            console.error('Error creating collection:', error);
            res.status(500).json({ message: 'Internal server error' });
        });
}
const removeCollection = async (req, res) => {
    const { name } = req.body;
    const appID = req.user.appId; // Assuming appId is stored in the user object
    if (!name) {
        return res.status(400).json({ message: 'Collection name is required' });
    }
    try {
        await mongoose.connection.dropCollection(`${name}_${appID}`);
        res.status(200).json({ message: 'Collection removed successfully' });
    } catch (error) {
        console.error('Error removing collection:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
module.exports = { createAppCollection,
    createCollection, removeCollection, removeAppCollection
};