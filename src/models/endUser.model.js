const mongoose = require('mongoose'); // ✅ đúng

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' }, // role theo app của bạn
    accountType: { type: String, enum: ['owner', 'end-user'], required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // end-user sẽ có
    appId: { type: mongoose.Schema.Types.ObjectId, ref: 'App' }, // end-user sẽ có
    refreshToken: {type: String}
}, { timestamps: true });

module.exports = userSchema;