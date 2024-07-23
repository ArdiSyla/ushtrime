const express = require('express');
const router = express.Router();
const Budget = require('../Models/Budget');

// GET all budgets
router.get('/', async (req, res) => {
    try {
        const budgets = await Budget.find();
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET a specific budget
router.get('/:id', getBudget, (req, res) => {
    res.json(res.budget);
});

// POST a new budget
router.post('/', async (req, res) => {
    const { type, amount, year, month } = req.body;

    const budget = new Budget({
        type,
        amount,
        year: type === 'yearly' ? year : undefined,
        month: type === 'monthly' ? month : undefined
    });

    try {
        const newBudget = await budget.save();
        res.status(201).json(newBudget);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE a budget
router.patch('/:id', getBudget, async (req, res) => {
    if (req.body.type != null) {
        res.budget.type = req.body.type;
    }
    if (req.body.amount != null) {
        res.budget.amount = req.body.amount;
    }
    if (req.body.year != null) {
        res.budget.year = req.body.year;
    }
    if (req.body.month != null) {
        res.budget.month = req.body.month;
    }

    try {
        const updatedBudget = await res.budget.save();
        res.json(updatedBudget);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE a budget
router.delete('/:id', async (req, res) => {
    try {
        const deletedBudget = await Budget.findByIdAndDelete(req.params.id);
        if (!deletedBudget) {
            return res.status(404).json({ message: 'Budget not found' });
        }
        res.json({ message: 'Budget deleted successfully', deletedBudget });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Middleware function to get single budget by ID
async function getBudget(req, res, next) {
    let budget;
    try {
        budget = await Budget.findById(req.params.id);
        if (budget == null) {
            return res.status(404).json({ message: 'Budget not found' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

    res.budget = budget;
    next();
}

module.exports = router;
