const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    source: String,
    amount: Number,
    date: {type: Date, default: Date.now},
    description: String,
    received: Boolean
});

module.exports = mongoose.model('Income', IncomeSchema);
