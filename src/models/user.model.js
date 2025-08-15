// models/userOwner.model.js
const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
    email: String,
    password: String,
    apps: [
        {
            appId: String,
            name: String,
            createdAt: { type: Date, default: Date.now },
            collection: [
                {
                    name: String,
                    createDate: { type: Date, default: Date.now }
                }
            ]
        }
    ],
    role: { type: String, enum: ['owner'], default: 'owner' },
    refreshToken: String
}, { timestamps: true });

module.exports = mongoose.model('Owner', ownerSchema);

