import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import './BudgetTrackerPage.css'; // Your main CSS file
import Chart from 'chart.js/auto'; // Import Chart.js
import Sidebar from './Sidebar'; // Import the Sidebar component

const BudgetTrackerPage = () => {
    const [budgets, setBudgets] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [incomes, setIncomes] = useState([]);
    const [monthlyData, setMonthlyData] = useState({ expenses: {}, budgets: {} });
    const [yearlyData, setYearlyData] = useState({ expenses: {}, budgets: {} });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('chart'); // State to manage active tab ('budgets', 'expenses', 'chart')
    const [viewMode, setViewMode] = useState('yearly'); // State to manage view mode
    const chartRef = useRef(null); // Reference to store the chart instance

    useEffect(() => {
        const axiosInstance = axios.create();

        axiosInstance.interceptors.request.use(
            config => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            error => {
                return Promise.reject(error);
            }
        );

        const fetchData = async () => {
            try {
                const budgetsResponse = await axiosInstance.get('http://localhost:5001/api/budgets');
                const fetchedBudgets = budgetsResponse.data;
                setBudgets(fetchedBudgets);

                const expensesResponse = await axiosInstance.get('http://localhost:5001/api/expenses');
                const fetchedExpenses = expensesResponse.data.expenses;
                setExpenses(fetchedExpenses);

                const incomesResponse = await axiosInstance.get('http://localhost:5001/api/incomes');
                setIncomes(incomesResponse.data.incomes);

                setMonthlyData(calculateMonthlyData(fetchedExpenses, fetchedBudgets));
                setYearlyData(calculateYearlyData(fetchedExpenses, fetchedBudgets));

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                if (error.response && error.response.status === 403) {
                    setError('Unauthorized access. Please log in.');
                } else {
                    setError('Failed to fetch data. Please try again later.');
                }
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            // Cleanup chart instance when component unmounts
            if (chartRef.current) {
                chartRef.current.destroy();
            }
            axiosInstance.interceptors.request.eject();
        };
    }, []);

    const calculateMonthlyData = (expenses, budgets) => {
        const monthlyExpenses = {};
        const monthlyBudgets = {};

        // Calculate monthly expenses
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;

            if (!monthlyExpenses[monthYear]) {
                monthlyExpenses[monthYear] = 0;
            }
            monthlyExpenses[monthYear] += expense.amount;
        });

        // Calculate monthly budgets
        budgets.forEach(budget => {
            const startDate = new Date(budget.startDate);
            const endDate = budget.endDate ? new Date(budget.endDate) : new Date();

            let currentDate = new Date(startDate);

            while (currentDate <= endDate) {
                const monthYear = `${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
                
                if (!monthlyBudgets[monthYear]) {
                    monthlyBudgets[monthYear] = 0;
                }
                monthlyBudgets[monthYear] += budget.amount / ((endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth() + 1);

                // Move to the next month
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        });

        return { expenses: monthlyExpenses, budgets: monthlyBudgets };
    };

    const calculateYearlyData = (expenses, budgets) => {
        const yearlyExpenses = {};
        const yearlyBudgets = {};

        expenses.forEach(expense => {
            const year = new Date(expense.date).getFullYear();

            if (!yearlyExpenses[year]) {
                yearlyExpenses[year] = 0;
            }
            yearlyExpenses[year] += expense.amount;
        });

        budgets.forEach(budget => {
            const year = new Date(budget.startDate).getFullYear();

            if (!yearlyBudgets[year]) {
                yearlyBudgets[year] = 0;
            }
            yearlyBudgets[year] += budget.amount;
        });

        return { expenses: yearlyExpenses, budgets: yearlyBudgets };
    };

    const monthlyLabels = Object.keys(monthlyData.expenses);
    const monthlyExpensesAmounts = Object.values(monthlyData.expenses);
    const monthlyBudgetsAmounts = Object.values(monthlyData.budgets);

    const yearlyLabels = Object.keys(yearlyData.expenses);
    const yearlyExpensesAmounts = Object.values(yearlyData.expenses);
    const yearlyBudgetsAmounts = Object.values(yearlyData.budgets);

    const data = {
        labels: viewMode === 'yearly' ? yearlyLabels : monthlyLabels,
        datasets: [
            {
                label: 'Budget Amount',
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(54, 162, 235, 0.8)',
                hoverBorderColor: 'rgba(54, 162, 235, 1)',
                data: viewMode === 'yearly' ? yearlyBudgetsAmounts : monthlyBudgetsAmounts,
            },
            {
                label: 'Actual Expenses',
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(255, 99, 132, 0.8)',
                hoverBorderColor: 'rgba(255, 99, 132, 1)',
                data: viewMode === 'yearly' ? yearlyExpensesAmounts : monthlyExpensesAmounts,
            },
        ],
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'budgets':
                return (
                    <div className="card">
                        <h2>Budgets</h2>
                        <ul className="budgets-list">
                            {budgets.map(budget => (
                                <li key={budget._id}>
                                    <p>Type: {budget.type}</p>
                                    <p>Amount: ${budget.amount}</p>
                                    <p>Start Date: {new Date(budget.startDate).toLocaleDateString()}</p>
                                    <p>End Date: {budget.endDate ? new Date(budget.endDate).toLocaleDateString() : 'N/A'}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            case 'expenses':
                return (
                    <div className="card">
                        <h2>Expenses</h2>
                        <ul className="expenses-list">
                            {Array.isArray(expenses) && expenses.length > 0 ? (
                                expenses.map(expense => (
                                    <li key={expense._id}>
                                        <p>Category: {expense.category}</p>
                                        <p>Amount: ${expense.amount}</p>
                                        <p>Date: {new Date(expense.date).toLocaleDateString()}</p>
                                        <p>Description: {expense.description}</p>
                                    </li>
                                ))
                            ) : (
                                <p className="no-data-message">No expenses found.</p>
                            )}
                        </ul>
                    </div>
                );
            case 'chart':
                return (
                    <div className="card">
                        <h2>Budget vs. Actual Expenses</h2>
                        <div className="view-mode-switcher">
                            <button className={`view-mode-button ${viewMode === 'yearly' ? 'active' : ''}`} onClick={() => setViewMode('yearly')}>Yearly</button>
                            <button className={`view-mode-button ${viewMode === 'monthly' ? 'active' : ''}`} onClick={() => setViewMode('monthly')}>Monthly</button>
                        </div>
                        <div className="chart-container">
                            <Bar data={data} options={{
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true
                                    }
                                }
                            }} />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="budget-tracker-container">
            <Sidebar /> {/* Include the Sidebar component */}
            <div className="main-content">
                <div className="tabs">
                    <button className={`tab-button ${activeTab === 'chart' ? 'active' : ''}`} onClick={() => setActiveTab('chart')}>Chart</button>
                    <button className={`tab-button ${activeTab === 'budgets' ? 'active' : ''}`} onClick={() => setActiveTab('budgets')}>Budgets</button>
                    <button className={`tab-button ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>Expenses</button>
                </div>
                <h1>Budget Tracker</h1>
                {renderContent()}
            </div>
        </div>
    );
};

export default BudgetTrackerPage;
