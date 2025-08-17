const mongoose = require('mongoose'); // ✅ đúng

const endUserSchema = new mongoose.Schema({
    appId: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: true }, // liên kết với app
    email: { type: String },
    password: { type: String, required: true },
    profile: {
        name: { type: String, },
        avatar: { type: String },
        phone: { type: String },
        birthday: { type: Date },
        gender: { type: String, enum: ['male', 'female', 'other'] },
        preferences: { type: Map, of: mongoose.Schema.Types.Mixed }
    },
    createDate: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now }
});

module.exports = mongoose.model('endUser', endUserSchema);