const express = require('express');
const router = express.Router();
const Budget = require('../Models/Budget');
const Expense = require('../Models/Expense');
const Income = require('../Models/Income');
const verifyToken = require('../verifyToken');

// Middleware function to get total expenses for a specific period
async function getTotalExpenses(startDate, endDate) {
    try {
        const expenses = await Expense.find({
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            }
        });

        const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
        return totalExpenses;
    } catch (error) {
        throw new Error(`Error while fetching total expenses: ${error.message}`);
    }
}

// Middleware function to get total incomes for a specific period
async function getTotalIncomes(startDate, endDate) {
    try {
        const incomes = await Income.find({
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            }
        });

        const totalIncomes = incomes.reduce((acc, income) => acc + income.amount, 0);
        return totalIncomes;
    } catch (error) {
        throw new Error(`Error while fetching total incomes: ${error.message}`);
    }
}

// GET budget tracking details
router.get('/', verifyToken, async (req, res) => {
    const { type, startDate, endDate } = req.query;

    try {
        // Fetch the budget for the given type and period
        const budget = await Budget.findOne({ type });

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        // Calculate total expenses for the specified period
        const totalExpenses = await getTotalExpenses(startDate, endDate);

        // Calculate total incomes for the specified period
        const totalIncomes = await getTotalIncomes(startDate, endDate);

        // Calculate remaining budget
        const remainingBudget = budget.amount - totalExpenses;

        res.json({
            budget,
            totalExpenses,
            totalIncomes,
            remainingBudget,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
