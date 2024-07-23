const express = require('express');
const Expense = require('../Models/Expense');
const verifyToken = require('../verifyToken');
const router = express.Router();
const Budget = require('../Models/Budget'); 



router.post('/', verifyToken, async (req, res) => {
    const { category, amount, description, date, paid } = req.body;

    if (!category || !amount || !date) {
        return res.status(400).json({ message: 'Category, amount, and date are required fields.' });
    }

    try {
        const expenseDate = new Date(date);
        const currentYear = expenseDate.getFullYear();

        console.log('Expense Date:', expenseDate);
        console.log('Current Year:', currentYear);

        const yearlyBudget = await Budget.findOne({
            type: 'yearly',
            year: currentYear
        });

        console.log('Yearly Budget:', yearlyBudget);

        if (!yearlyBudget) {
            return res.status(400).json({ message: 'Yearly budget is not defined for the current year.' });
        }

        const totalExpenses = await Expense.aggregate([
            { $match: { user: req.user.id, date: { $gte: new Date(currentYear, 0, 1), $lte: new Date(currentYear, 11, 31) } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalSpent = totalExpenses.length > 0 ? totalExpenses[0].total : 0;

        console.log('Total Spent:', totalSpent);
        console.log('Yearly Budget Amount:', yearlyBudget.amount);

        if (totalSpent + amount > yearlyBudget.amount) {
            return res.status(400).json({ message: 'Adding this expense would exceed your yearly budget.' });
        }

        const newExpense = new Expense({
            user: req.user.id,
            category,
            amount,
            description,
            date,
            paid,
        });
        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Server error:', error);
        res.status(400).json({ message: error.message });
    }
});

router.get('/', verifyToken, async (req, res) => {
    console.log('get expenses');

    const { name, amount, amountCondition, paid, date, dateCondition, page = 1, limit = 10, sortField, sortOrder } = req.query; // Added pagination and sorting parameters

    let query = { user: req.user.id };
    if (name) {
        console.log(name);
        query.category = { $regex: new RegExp(name, 'i') };
    }

    if (amount) {
        const amountValue = parseFloat(amount);
        if (amountCondition === 'equal') {
            query.amount = amountValue;
        } else if (amountCondition === 'bigger') {
            query.amount = { $gt: amountValue };
        } else if (amountCondition === 'smaller') {
            query.amount = { $lt: amountValue };
        }
    }

    if (paid) {
        query.paid = paid === "true";
    }

    if (date) {
        const dateValue = new Date(date);
        if (dateCondition === 'equal') {
            query.date = dateValue;
        } else if (dateCondition === 'bigger') {
            query.date = { $gt: dateValue };
        } else if (dateCondition === 'smaller') {
            query.date = { $lt: dateValue };
        }
    }

    const options = {
        skip: (page - 1) * limit, // Added pagination logic
        limit: parseInt(limit),
    };

    if (sortField && sortOrder) {
        options.sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 }; // Added sorting logic
    }

    try {
        const expenses = await Expense.find(query, null, options); // Modified to use pagination and sorting
        const total = await Expense.countDocuments(query); // Added total count for pagination

        res.json({
            expenses,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get one expense by ID
router.get('/:expenseId', verifyToken, async (req, res) => {
    const { expenseId } = req.params;

    try {
        const expense = await Expense.findById(expenseId);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });  
        }
        res.json(expense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update an expense by ID
router.put('/:expenseId', verifyToken, async (req, res) => {
    console.log('update expense');
    const { expenseId } = req.params;

    try {
        const updatedExpense = await Expense.findByIdAndUpdate(expenseId, req.body, { new: true, runValidators: true });  
        if (!updatedExpense) {
            return res.status(404).json({ message: 'Expense not found' });  
        }
        res.json(updatedExpense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:expenseId', verifyToken, async (req, res) => {
    console.log('delete expense');
    const { expenseId } = req.params;
    console.log(expenseId);

    try {
        const deletedExpense = await Expense.findByIdAndDelete(expenseId);
        if (!deletedExpense) {
            return res.status(404).json({ message: 'Expense not found' });  
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
