const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref:'user'},
    category: String,
    amount: Number,
    date: {type: Date, default: Date.now},
    description: String,
    paid: Boolean,
});

module.exports = mongoose.model('Expense', ExpenseSchema);