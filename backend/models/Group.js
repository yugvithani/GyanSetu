const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
});

const GroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [MemberSchema],
    materials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Material' }],
    isPrivate: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Group', GroupSchema);