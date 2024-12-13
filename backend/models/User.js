const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    type: { type: String, required: true },
    details: { type: String },
    timestamp: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    profilePicture: { type: String },
    activities: [ActivitySchema],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    adminGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
});

module.exports = mongoose.model('User', UserSchema);