import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import './budget.css'; // Import the newly created budget styles
import Sidebar from './Sidebar';

function BudgetDashboard() {
    const [budgets, setBudgets] = useState([]);
    const [formData, setFormData] = useState({
        type: 'monthly',
        amount: '',
        startDate: '',
        endDate: '', // Added endDate field
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

        // Automatically set endDate for yearly type when startDate is selected
        if (name === 'startDate' && formData.type === 'yearly') {
            const startDate = new Date(value);
            const endDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
            const formattedEndDate = endDate.toISOString().slice(0, 10); // Format as yyyy-mm-dd

            setFormData({
                ...formData,
                startDate: value,
                endDate: formattedEndDate,
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBudgetId) {
                await api.patch(`/budgets/${editingBudgetId}`, formData);
                setEditingBudgetId(null);
                alert('Budget updated successfully');
            } else {
                await api.post('/budgets', formData);
                alert('Budget added successfully');
            }
            getBudgets();
            setFormData({ type: 'monthly', amount: '', startDate: '', endDate: '' }); // Reset form data
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
                startDate: selectedBudget.startDate,
                endDate: selectedBudget.endDate || '',
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
                    <label>
                        Start Date:
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={onChange}
                            required
                        />
                    </label>
                    {formData.type === 'yearly' && ( // Render only for yearly type
                        <label>
                            End Date:
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={onChange}
                                disabled={formData.type !== 'yearly'} // Disable if type is not yearly
                            />
                        </label>
                    )}
                    {formData.type === 'monthly' && ( // Render only for monthly type
                        <label>
                            End Date:
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={onChange}
                            />
                        </label>
                    )}
                    <button type="submit">{editingBudgetId ? 'Update Budget' : 'Add Budget'}</button>
                </form>

                <table className="budget-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {budgets.map((budget) => (
                            <tr key={budget._id}>
                                <td>{budget.type}</td>
                                <td>${budget.amount.toFixed(2)}</td>
                                <td>{new Date(budget.startDate).toLocaleDateString()}</td>
                                <td>{budget.endDate ? new Date(budget.endDate).toLocaleDateString() : '-'}</td>
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
