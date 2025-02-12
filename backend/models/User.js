const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    type: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    bio: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    profilePicture: { type: String },
    activities: [ActivitySchema],
    memberGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    adminGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
});

module.exports = mongoose.model('User', UserSchema);