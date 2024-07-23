const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['monthly', 'yearly'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: function() { return this.type === 'yearly'; }
    },
    month: {
        type: String,
        required: function() { return this.type === 'monthly'; },
        enum: [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]
    }
});

module.exports = mongoose.model('Budget', budgetSchema);
