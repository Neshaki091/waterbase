// models/userOwner.model.js
const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
    email: String,
    password: String,
    apps: [
        {
            name: String,
        }
    ],
    role: { type: String, enum: ['owner'], default: 'owner' },
    refreshToken: String
}, { timestamps: true });

module.exports = mongoose.model('Owner', ownerSchema);

