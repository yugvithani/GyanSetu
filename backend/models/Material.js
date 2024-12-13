const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    uploadDate: { type: Date, default: Date.now },
    visibility: { type: String, enum: ['public', 'private'], default: 'private' },
    version: { type: Number, default: 1 },
    tags: [{ type: String }],
});

module.exports = mongoose.model('Material', MaterialSchema);
