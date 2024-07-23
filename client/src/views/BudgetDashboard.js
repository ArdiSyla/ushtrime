import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import './budget.css'; // Import the newly created budget styles
import Sidebar from './Sidebar';

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function BudgetDashboard() {
    const [budgets, setBudgets] = useState([]);
    const [formData, setFormData] = useState({
        type: 'monthly',
        amount: '',
        year: '',
        month: ''
    });
    const [editingBudgetId, setEditingBudgetId] = useState(null);
    const navigate = useNavigate();

    const getBudgets = async () => {
        try {
            const response = await api.get('/budgets');
            setBudgets(response.data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
        }
    };

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/');
            return;
        }
        getBudgets();
    }, [navigate]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const budgetData = {
                ...formData,
                year: formData.type === 'yearly' ? formData.year : undefined,
                month: formData.type === 'monthly' ? formData.month : undefined
            };

            if (editingBudgetId) {
                await api.patch(`/budgets/${editingBudgetId}`, budgetData);
                setEditingBudgetId(null);
                alert('Budget updated successfully');
            } else {
                await api.post('/budgets', budgetData);
                alert('Budget added successfully');
            }
            getBudgets();
            setFormData({ type: 'monthly', amount: '', year: '', month: '' }); // Reset form data
        } catch (error) {
            console.error('Error saving budget:', error);
            alert('Error saving budget');
        }
    };

    const editBudget = (budgetId) => {
        const selectedBudget = budgets.find((budget) => budget._id === budgetId);
        if (selectedBudget) {
            setFormData({
                type: selectedBudget.type,
                amount: selectedBudget.amount,
                year: selectedBudget.year || '',
                month: selectedBudget.month || ''
            });
            setEditingBudgetId(budgetId);
        }
    };

    const deleteBudget = async (budgetId) => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
            try {
                await api.delete(`/budgets/${budgetId}`);
                alert('Budget deleted successfully');
                getBudgets();
            } catch (error) {
                console.error('Error deleting budget:', error);
                alert('Error deleting budget');
            }
        }
    };

    return (
        <div>
            <Sidebar />
            <div className="budget-container">
                <h1>Budgets</h1>
                <form className="budget-form" onSubmit={onSubmit}>
                    <label>
                        Type:
                        <select name="type" value={formData.type} onChange={onChange} required>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </label>
                    <label>
                        Amount:
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={onChange}
                            required
                        />
                    </label>
                    {formData.type === 'yearly' && (
                        <label>
                            Year:
                            <input
                                type="number"
                                name="year"
                                value={formData.year}
                                onChange={onChange}
                                required
                                min="2024"
                                max="2100"
                            />
                        </label>
                    )}
                    {formData.type === 'monthly' && (
                        <label>
                            Month:
                            <select
                                name="month"
                                value={formData.month}
                                onChange={onChange}
                                required
                            >
                                <option value="">Select Month</option>
                                {monthNames.map((month) => (
                                    <option key={month} value={month}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                    <button type="submit">{editingBudgetId ? 'Update Budget' : 'Add Budget'}</button>
                </form>

                <table className="budget-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Year/Month</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {budgets.map((budget) => (
                            <tr key={budget._id}>
                                <td>{budget.type}</td>
                                <td>${budget.amount.toFixed(2)}</td>
                                <td>
                                    {budget.type === 'yearly'
                                        ? budget.year
                                        : budget.type === 'monthly'
                                        ? budget.month
                                        : ''}
                                </td>
                                <td>
                                    <button onClick={() => editBudget(budget._id)}>Edit</button>
                                    <button onClick={() => deleteBudget(budget._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default BudgetDashboard;
