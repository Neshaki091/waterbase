const mongoose = require('mongoose');

const createDocument = async (req, res) => {
    const { documentName } = req.body;
    if (!documentName) {
        return res.status(400).json({ message: 'document name is required' });
    }
    mongoose.createDocument(documentName, req.body);
    res.status(201).json({ message: 'Document created successfully' });
};  

const removeDocument = async (req, res) => {
    const { documentName } = req.body;
    if (!documentName) {
        return res.status(400).json({ message: 'document name is required' });
    }
    try {
        await mongoose.connection.dropDocument(documentName);
        res.status(200).json({ message: 'Document removed successfully' });
    }
    catch (error) {
        console.error('Error removing document:', error);
        res.status(500).json({ message: 'Internal server error' });
    }   
};
module.exports = {
    createDocument, removeDocument,
};