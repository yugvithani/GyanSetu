const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    type: [{ type: String, enum: ['message', 'material', 'session'], required: true }],
    content: { type: String },
    timestamp: { type: Date, default: Date.now },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
});

module.exports = mongoose.model('Item', ItemSchema);