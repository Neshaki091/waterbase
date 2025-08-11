const { mongo } = require("mongoose");

const fileSchema = mongo.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    type: { 
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongo.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    metadata: {
        type: Object,
        default: {},
    },
});

module.exports = mongo.model('File', fileSchema);