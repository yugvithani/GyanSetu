const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },  
    content: { type: String, required: true }, 
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Activity', ActivitySchema);
