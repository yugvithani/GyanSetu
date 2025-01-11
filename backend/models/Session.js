const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    isLive: { type: Boolean, required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'} ],
    startTime : { type: Date },
    group : { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
});

module.exports = mongoose.model('Session', SessionSchema);