// models/Budget.js
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
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date // Add endDate field to the schema
    }
    
});

module.exports = mongoose.model('Budget', budgetSchema);
